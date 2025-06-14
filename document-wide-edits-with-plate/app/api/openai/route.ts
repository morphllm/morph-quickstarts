import { NextRequest } from 'next/server'
import OpenAI from 'openai'

// Ensure the API key is present; the @ai-sdk/openai client reads it from env by default (OPENAI_API_KEY)

// Morph Apply client
const morph = new OpenAI({
  apiKey: process.env.MORPH_API_KEY,
  baseURL: 'https://api.morphllm.com/v1'
})

// Direct OpenAI client (default baseURL) for function-calling requests
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { messages, context } = body as any

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

FOR EDITING REQUESTS, you MUST use the editing tool with this EXACT format:

CRITICAL: You MUST use "// ... existing code ..." markers. DO NOT return the full document.
NEVER respond with edits in the chat - ALWAYS use the tool.

Example for "expand the benefits section":
// ... existing code ...
## Key Benefits of Remote Work

- **Flexibility and Work-Life Balance**  
[EXPANDED CONTENT HERE WITH MORE DETAILS]

- **Global Talent Access**  
[EXPANDED CONTENT HERE WITH MORE DETAILS]

// ... existing code ...

WRONG (DO NOT DO THIS): Responding with edits in chat
RIGHT (DO THIS): Use the editing tool with // ... existing code ... markers

You should bias towards repeating as few lines of the original document as possible to convey the change.
Each edit should contain sufficient context of unchanged lines around the content you're editing to resolve ambiguity.
If you plan on deleting a section, you must provide surrounding context to indicate the deletion.
DO NOT omit spans of pre-existing content without using the // ... existing code ... comment to indicate its absence.`
      
    if (context?.fullDocument) {
      system += `\n\nCurrent document:\n\n${context.fullDocument}`;
    }

    // Step 1: Ask OpenAI to generate edit instructions
    console.info('[OpenAI] Starting request with context:', {
      hasFullDocument: !!context?.fullDocument,
      documentLength: context?.fullDocument?.length,
      messageCount: messages.length
    })

    console.info('[OpenAI] User messages:', messages)

    // Tool definition for edit instructions (not full document)
    const tools: any = [
      {
        type: 'function',
        function: {
          name: 'provide_edit_instructions',
          description: 'Use this tool to propose an edit to an existing file. This will be read by a less intelligent model, which will quickly apply the edit. You should make it clear what the edit is, while also minimizing the unchanged code you write. When writing the edit, you should specify each edit in sequence, with the special comment // ... existing code ... to represent unchanged code in between edited lines. You should bias towards repeating as few lines of the original file as possible to convey the change. Each edit should contain sufficient context of unchanged lines around the code you\'re editing to resolve ambiguity. If you plan on deleting a section, you must provide surrounding context to indicate the deletion. DO NOT omit spans of pre-existing code without using the // ... existing code ... comment to indicate its absence.',
          parameters: {
            type: 'object',
            properties: {
              code_edit: {
                type: 'string',
                description: 'The edited content with // ... existing code ... markers to indicate unchanged sections. Include enough context around the changes for proper placement.'
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
      return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }

    let args: any
    try {
      args = JSON.parse(toolCall.function.arguments as string)
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
      const morphStream = await morph.chat.completions.create({
        model: 'morph-v2',
        stream: true,
        messages: [
          {
            role: 'user',
            content: `<code>${context.fullDocument}</code>\n<update>${args.code_edit.trim()}</update>`
          }
        ]
      })

      let morphOutput = ''
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(encoder.encode('<updated_document>'))
            for await (const chunk of morphStream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                morphOutput += content
                controller.enqueue(encoder.encode(content))
              }
            }
            controller.enqueue(encoder.encode('</updated_document>'))
            controller.close()
          } catch (error) {
            console.error('[Morph] Stream error:', error)
            controller.error(error)
          }
        }
      })

      return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    } catch (error) {
      console.error('[Morph] API error:', error)
      console.error('[Morph] Request details:', {
        model: 'morph-v3-fast',
        inputLength: context.fullDocument.length,
        updateLength: args.code_edit.length,
        hasApiKey: !!process.env.MORPH_API_KEY,
        requestFormat: 'XML-tag'
      })
      return new Response(JSON.stringify({ 
        error: 'Failed to apply changes via Morph',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), { status: 500 })
    }
  }

  // Quick-action path removed – any request that is not a chat/full-doc edit is unsupported
  return new Response(JSON.stringify({ error: 'Unsupported request' }), { status: 400 })
}

 