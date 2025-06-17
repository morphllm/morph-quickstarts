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
  baseURL: 'https://api.morphllm.com/v1'
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
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    hasMessages: Array.isArray(messages),
    messageCount: Array.isArray(messages) ? messages.length : 0,
    hasContext: !!context,
    contextKeys: context ? Object.keys(context) : [],
    bodyKeys: Object.keys(body),
    userAgent: req.headers.get('user-agent'),
    contentType: req.headers.get('content-type')
  })

  if (Array.isArray(messages)) {
    console.info('[Request] Message details:', {
      messages: messages.map((msg, idx) => ({
        index: idx,
        role: msg.role,
        contentLength: msg.content?.length || 0,
        contentPreview: msg.content?.substring(0, 150) + (msg.content?.length > 150 ? '...' : '')
      }))
    })
  }

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

CRITICAL RULES:
1. You MUST use "// ... existing code ..." markers
2. DO NOT return the full document - ONLY show the specific changes
3. Show MINIMAL context - just enough to identify where changes go
4. NEVER include more than 10-15 lines of actual content
5. Use "// ... existing code ..." for everything else

CORRECT example for "expand the benefits section":
// ... existing code ...
## Key Benefits

**Flexibility and Work-Life Balance**
Employees can structure their day around personal commitments while maintaining productivity. This expanded flexibility leads to higher job satisfaction, reduced burnout rates, and better overall work-life integration. Remote workers often report improved mental health and stronger family relationships.

**Global Talent Access**
Companies can hire the best talent regardless of geographic location, expanding their talent pool significantly. This leads to more diverse teams, innovative solutions, and competitive advantages in the global marketplace.
// ... existing code ...

WRONG examples (DO NOT DO):
❌ Returning the entire document
❌ Including sections that don't need changes
❌ Showing full paragraphs that aren't being modified

Remember: Show ONLY what changes, mark everything else as "// ... existing code ..."`
      
    if (context?.fullDocument) {
      const docJson = JSON.stringify(context.fullDocument, null, 2)
      system += `\n\nCurrent document (Slate JSON):\n\n${docJson}`
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

    // Log the complete OpenAI response
    console.info('[OpenAI] Complete response:', {
      id: openaiResp.id,
      model: openaiResp.model,
      usage: openaiResp.usage,
      choices: openaiResp.choices.map(choice => ({
        index: choice.index,
        finishReason: choice.finish_reason,
        message: {
          role: choice.message.role,
          content: choice.message.content,
          toolCalls: choice.message.tool_calls?.map(tc => ({
            id: tc.id,
            type: tc.type,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments
            }
          }))
        }
      }))
    })

    const choice = openaiResp.choices[0]
    
    // Log the selected choice details
    console.info('[OpenAI] Selected choice:', {
      finishReason: choice.finish_reason,
      hasToolCall: !!choice.message.tool_calls?.length,
      contentLength: choice.message.content?.length || 0,
      content: choice.message.content
    })
    
    // If model decided to call the tool
    const toolCall = choice.message.tool_calls?.[0]
    if (!toolCall) {
      // No tool call – treat as plain assistant answer, stream back to client
      const content = choice.message.content || ''
      console.info('[OpenAI] No tool call - returning plain response:', {
        contentLength: content.length,
        contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
      })
      return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }

    // Log tool call details
    console.info('[OpenAI] Tool call detected:', {
      toolId: toolCall.id,
      functionName: toolCall.function.name,
      argumentsLength: toolCall.function.arguments.length,
      rawArguments: toolCall.function.arguments
    })

    let args: any
    try {
      args = JSON.parse(toolCall.function.arguments as string)
      console.info('[OpenAI] Parsed tool arguments:', {
        hasCodeEdit: !!args.code_edit,
        codeEditLength: args.code_edit?.length || 0,
        codeEditPreview: args.code_edit?.substring(0, 300) + (args.code_edit?.length > 300 ? '...' : '')
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
        model: 'morph-v3-fast',
        inputDocumentLength: context.fullDocument.length,
        codeEditLength: args.code_edit.trim().length,
        hasApiKey: !!process.env.MORPH_API_KEY
      })

      // Create multi-step streaming response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Step 1: Send planning message with code_edit preview
            const planningContent = `I'll help you with that. Here's what I'm planning to change:\n\n\`\`\`\n${args.code_edit.trim()}\n\`\`\`\n\n`
            controller.enqueue(encoder.encode(planningContent))

            // Step 2: Apply via Morph using the code edit (existing logic)
            const morphStream = await morph.chat.completions.create({
              model: 'morph-v3-fast',
              stream: true,
              messages: [
                {
                  role: 'user',
                  content: `<code>${context.fullDocument}</code>\n<update>${args.code_edit.trim()}</update>`
                }
              ]
            })

            let morphOutput = ''
            let chunkCount = 0
            controller.enqueue(encoder.encode('<updated_document>'))
            console.info('[Morph] Starting stream processing')
            
            for await (const chunk of morphStream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                morphOutput += content
                chunkCount++
                controller.enqueue(encoder.encode(content))
                
                // Log every 50th chunk or if content contains special markers
                if (chunkCount % 50 === 0 || content.includes('\n#') || content.includes('</')) {
                  console.info(`[Morph] Stream chunk ${chunkCount}:`, {
                    chunkLength: content.length,
                    totalOutputLength: morphOutput.length,
                    chunkPreview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
                  })
                }
              }
            }
            
            console.info('[Morph] Stream completed:', {
              totalChunks: chunkCount,
              finalOutputLength: morphOutput.length,
              outputPreview: morphOutput.substring(0, 500) + (morphOutput.length > 500 ? '...' : ''),
              outputSuffix: morphOutput.length > 500 ? '...' + morphOutput.slice(-200) : ''
            })
            
            controller.enqueue(encoder.encode('</updated_document>'))
            controller.close()
          } catch (error) {
            console.error('[Multi-step stream error]:', error)
            console.error('[Multi-step stream error details]:', {
              chunkCount: 0,
              outputLength: 0,
              error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
              } : error
            })
            controller.error(error)
          }
        }
      })

      console.info('[Response] Returning multi-step streaming response to client:', {
        contentType: 'text/plain; charset=utf-8',
        responseType: 'multi-step-stream'
      })
      
      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    } catch (error) {
      console.error('[Morph] API error:', error)
      console.error('[Morph] Request details:', {
        model: 'morph-v3-fast',
        inputLength: context.fullDocument.length,
        updateLength: args.code_edit.length,
        hasApiKey: !!process.env.MORPH_API_KEY,
        requestFormat: 'XML-tag'
      })
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
  console.info('[Request] Unsupported request type:', {
    hasMessages: Array.isArray(body.messages),
    bodyKeys: Object.keys(body)
  })
  return new Response(JSON.stringify({ error: 'Unsupported request' }), { status: 400 })
}

 