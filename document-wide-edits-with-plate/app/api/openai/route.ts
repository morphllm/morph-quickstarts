import { NextRequest } from 'next/server'
import OpenAI from 'openai'

// Plate markdown helpers
// import { markdownSerializer, markdownDeserializer } from '@platejs/markdown'
// import { createPlateEditor } from 'platejs'
// import {
//   ParagraphPlugin,
//   HeadingPlugin,
//   BlockquotePlugin,
//   BoldPlugin,
//   ItalicPlugin,
//   UnderlinePlugin,
//   StrikethroughPlugin,
//   CodePlugin,
//   LinkPlugin,
// } from '@platejs/basic-nodes'

// Ensure the API key is present; the @ai-sdk/openai client reads it from env by default (OPENAI_API_KEY)

// Morph Apply client
const morph = new OpenAI({
  apiKey: process.env.MORPH_API_KEY,
  baseURL: 'https://morph--api-serve-dev.modal.run/v1'
})

// Direct OpenAI client (default baseURL) for function-calling requests
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

//   ─── Helper: build a headless editor once per module ────────────────────
// const mdEditor = createPlateEditor({
//   plugins: [
//     ParagraphPlugin,
//     HeadingPlugin,
//     BlockquotePlugin,
//     BoldPlugin,
//     ItalicPlugin,
//     UnderlinePlugin,
//     StrikethroughPlugin,
//     CodePlugin,
//     LinkPlugin,
//   ],
//   value: [],
// })

// function slateToMarkdown(value: any): string {
//   if (!Array.isArray(value)) return String(value || '')
//   mdEditor.children = value
//   return markdownSerializer(mdEditor)
// }

// function markdownToSlate(md: string) {
//   return markdownDeserializer(md, { plugins: mdEditor.plugins })
// }

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { messages, context } = body as any

  // Log incoming request details
  console.info('[Request] OpenAI API called:', {
    messageCount: Array.isArray(messages) ? messages.length : 0,
    hasContext: !!context,
    contextKeys: context ? Object.keys(context) : []
  })

  /*
    ───────────────────────── Chat / Full-doc edits ─────────────────────────
  */
  if (Array.isArray(messages)) {
    let system = `You are an AI writing assistant that can help with both document questions and document editing.

CRITICAL: For ANY document editing request, you MUST use the editing tool. NEVER respond with edits in chat.

WHEN TO USE THE EDITING TOOL (REQUIRED):
- User asks to modify, change, edit, rewrite, or update any part of the document
- User requests making content shorter, longer, clearer, etc.
- User wants to add, remove, or restructure content
- User asks to expand, elaborate, or enhance sections
- Examples: "make shorter", "rewrite this", "fix grammar", "add a section", "expand the benefits section"

WHEN TO RESPOND NORMALLY (NO TOOL):
- User asks questions about the document content
- User wants explanations or summaries of existing content
- User requests information or analysis
- Examples: "what is this about?", "explain the benefits", "summarize this"

FOR EDITING REQUESTS, you MUST use the editing tool following Morph's format:

When writing the edit, you should specify each edit in sequence, with the special comment // ... existing code ... to represent unchanged code in between edited lines.
NEVER output unmodified lines unless absolutely necessary to resolve ambiguity in the edit.

For example:
// ... existing code ...
FIRST_EDIT
// ... existing code ...
SECOND_EDIT
// ... existing code ...
THIRD_EDIT
// ... existing code ...

You should bias towards repeating as few lines of the original file as possible to convey the change.
NEVER show unmodified code in the edit, unless sufficient context of unchanged lines around the code you're editing is needed to resolve ambiguity.

HANDLING DELETIONS:
When you need to delete content, you MUST provide clear context around what's being deleted. Use the standard Morph approach:

Show the content before and after the deletion:
For example, if you have this initial code:
\`\`\`
function example() {
  const a = 1;
  console.log("remove me");
  const b = 2;
}
\`\`\`
To remove the console.log line, output:
\`\`\`
// ... existing code ...
const a = 1;
const b = 2;
// ... existing code ...
\`\`\`
This shows what remains after deletion by providing the surrounding context.

IMPORTANT DELETION RULES:
- NEVER paste or reproduce the entire document inside code_edit. Only provide the lines that need to change (plus minimal context) – typically 1-2 surrounding lines.
- ALWAYS include at least 1-2 lines of context before *and* after the deletion point so Morph can locate the section reliably.
- Simply omit the content you want to delete while showing the surrounding context that remains.
- For multi-line deletions, show the content before and after the entire block being removed.
- If deleting an entire section, include enough surrounding context to clearly identify the boundaries.
- Never leave ambiguity about what exactly should be deleted and never include unrelated, unchanged parts of the document.`
      
    if (context?.fullDocument) {
      const docJson = JSON.stringify(context.fullDocument, null, 2)
      system += `\n\nCurrent document (Slate JSON):\n\n${docJson}`
    }

    // Step 1: Ask OpenAI to generate edit instructions
    console.info('[OpenAI] Starting request')

    // Tool definition for edit instructions (following Morph's official documentation)
    const tools: any = [
      {
        type: 'function',
        function: {
          name: 'provide_edit_instructions',
          description: 'Use this tool to propose an edit to an existing file. This will be read by a less intelligent model, which will quickly apply the edit. You should make it clear what the edit is, while also minimizing the unchanged code you write. When writing the edit, you should specify each edit in sequence, with the special comment // ... existing code ... to represent unchanged code in between edited lines. NEVER output unmodified lines unless absolutely necessary to resolve ambiguity in the edit. You should bias towards repeating as few lines of the original file as possible to convey the change. NEVER show unmodified code in the edit, unless sufficient context of unchanged lines around the code you\'re editing is needed to resolve ambiguity. If you plan on deleting a section, you must provide surrounding context to indicate the deletion. DO NOT omit spans of pre-existing code without using the // ... existing code ... comment to indicate its absence.',
          parameters: {
            type: 'object',
            properties: {
              code_edit: {
                type: 'string',
                description: 'Specify ONLY the precise lines of code that you wish to edit. Use // ... existing code ... for unchanged sections.'
              }
            },
            required: ['code_edit']
          }
        }
      }
    ]

    const openaiResp = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,
      stream: false,
      tool_choice: 'auto',
      tools,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ]
    })

    const choice = openaiResp.choices[0]
    
    // If model decided to call the tool
    const toolCall = choice.message.tool_calls?.[0]
    if (!toolCall) {
      // No tool call – treat as plain assistant answer, stream back to client
      const content = choice.message.content || ''
      console.info('[OpenAI] No tool call - returning plain response')
      return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }

    // Log tool call details
    console.info('[OpenAI] Tool call detected:', {
      functionName: toolCall.function.name,
      argumentsLength: toolCall.function.arguments.length
    })

    let args: any
    try {
      args = JSON.parse(toolCall.function.arguments as string)
      console.info('[OpenAI] Parsed tool arguments:', {
        hasCodeEdit: !!args.code_edit,
        codeEditLength: args.code_edit?.length || 0
      })
      
    } catch (err) {
      console.error('[OpenAI] Failed to parse tool arguments:', err)
      return new Response(JSON.stringify({ error: 'Invalid tool call arguments' }), { status: 500 })
    }

    if (!args.code_edit?.trim()) {
      console.error('[OpenAI] Empty code edit received from tool call')
      return new Response(JSON.stringify({ error: 'Tool call produced empty code edit' }), { status: 500 })
    }

    // Step 2: Apply via Morph using the code edit

    try {
      console.info('[Morph] Starting request:', {
        model: 'morph-v3-large',
        inputDocumentLength: context.fullDocument.length,
        codeEditLength: args.code_edit.trim().length
      })

      // Create multi-step streaming response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          let morphOutput = ''
          
          try {
            // Step 1: Send planning message with raw code_edit content ONLY
            const planningContent = `I'll help you with that.\n\n${args.code_edit.trim()}\n\nApplying changes...`
            controller.enqueue(encoder.encode(planningContent))

            // Step 2: Apply via Morph using the code edit (but don't include in chat response)
            console.info('[Morph] Creating stream request')

            // Test connection first with a simple non-streaming request
            try {
              const testResponse = await morph.chat.completions.create({
                model: 'morph-v3-large',
                stream: false,
                max_tokens: 10,
                messages: [{ role: 'user', content: 'test' }]
              })
              console.info('[Morph] Connection test successful')
            } catch (testError) {
              console.error('[Morph] Connection test failed:', testError)
              throw new Error(`Morph API connection failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`)
            }

            console.info('[Morph] Starting stream')
            const morphStream = await morph.chat.completions.create({
              model: 'morph-v3-large',
              stream: true,
              messages: [
                {
                  role: 'user',
                  content: `<code>${context.fullDocument}</code>\n<update>${args.code_edit.trim()}</update>`
                }
              ]
            })

            // Process Morph response but don't include in chat message
            console.info('[Morph] Starting stream processing')
            
            for await (const chunk of morphStream) {
              try {
                const content = chunk.choices[0]?.delta?.content || ''
                if (content) {
                  morphOutput += content
                }
              } catch (chunkError) {
                console.error('[Morph] Error processing chunk:', chunkError)
              }
            }
            
            console.info('[Morph] Stream completed')
            
            // Send the updated document first
            controller.enqueue(encoder.encode('<updated_document>'))
            controller.enqueue(encoder.encode(morphOutput))
            controller.enqueue(encoder.encode('</updated_document>'))

            // Send completion status after document update
            controller.enqueue(encoder.encode('\n\nChanges applied successfully.'))
            controller.close()
            
          } catch (error) {
            console.error('[Multi-step stream error]:', error)
            
            // Try to send error message to client
            try {
              const errorMsg = `\n\nFailed to apply changes: ${error instanceof Error ? error.message : 'Unknown error'}`
              controller.enqueue(encoder.encode(errorMsg))
            } catch (sendError) {
              console.error('[Stream] Failed to send error message:', sendError)
            }
            
            controller.error(error)
          }
        }
      })

      console.info('[Response] Returning multi-step streaming response to client')
      
      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    } catch (error) {
      console.error('[Morph] API error:', error)
      return new Response(
        JSON.stringify({
          error: 'Failed to apply changes via Morph',
          details: error instanceof Error ? error.message : 'Unknown error',
        }),
        { status: 500 }
      )
    }
  }

  // Quick-action path removed – any request that is not a chat/full-doc edit is unsupported
  console.info('[Request] Unsupported request type')
  return new Response(JSON.stringify({ error: 'Unsupported request' }), { status: 400 })
}

 