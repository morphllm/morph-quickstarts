"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Badge, Button, Avatar, IconWithBackground, IconButton, Tooltip } from "@/components/ui"
import * as SubframeCore from "@subframe/core"
import { 
  MessageSquare,
  Clock,
  Send,
  User,
  Bot,
  Loader2,
  Edit,
  History,
  Sparkle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Copy,
  MoreHorizontal,
  Share
} from 'lucide-react'

interface EditHistory {
  id: string
  timestamp: Date
  originalText: string
  newText: string
  transformation: string
  range?: {start:number; end:number}
}

interface NotionSidebarProps {
  selectedText: string
  editHistory: EditHistory[]
  document: string
  chatDraftText?: string
  selectionRange?: {start:number; end:number} | null
  onStreamUpdate?: (draft:string, done:boolean)=>void
}

// Helper function to extract planned changes from backticks
const extractPlannedChanges = (content: string): string | null => {
  const planningMatch = content.match(/Here's what I'm planning to change:\n\n```\n([\s\S]*?)\n```/)
  return planningMatch ? planningMatch[1] : null
}

const formatMessageContent = (content: string) => {
  // Check if this is a planning message
  if (content.startsWith("I'll help you with that.")) {
    // Extract content up to the <updated_document> tag
    const beforeUpdatedDoc = content.split('<updated_document>')[0]
    
    // Extract the content between the initial message and "Applying changes..."
    const parts = beforeUpdatedDoc.split("\n\n")
    const planningContent = parts.slice(1, -1).join("\n\n").trim()
    
    // Get the status messages
    const statusMessages = [
      'Applying changes...',
      'Changes applied successfully.'
    ]
    
    return {
      type: 'planning' as const,
      planningContent,
      statusUpdates: statusMessages.join('\n')
    }
  }
  return {
    type: 'regular' as const,
    content: content.split('<updated_document>')[0].trim()
  }
}

export default function NotionSidebar({ selectedText, editHistory, document, chatDraftText = '', selectionRange, onStreamUpdate }: NotionSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/openai',
    streamProtocol: 'text',
    body: {
      context: {
        selectedText: chatDraftText || undefined,
        fullDocument: document
      }
    },
    onFinish: (message) => {
      if (!message.content) return

      const content = message.content.trim()

      // Case 1: chatDraftText came from a selection – expect replacement
      if (chatDraftText && selectionRange) {
        let newDoc: string
        if (content === 'DELETE' || /\bdelete this\b/i.test(content) || /\bremove this\b/i.test(content)) {
          newDoc = document.substring(0, selectionRange.start) + document.substring(selectionRange.end)
        } else {
          newDoc = document.substring(0, selectionRange.start) + content + document.substring(selectionRange.end)
        }
        // send update directly to parent
        onStreamUpdate?.(newDoc, true)
        return
      }

      // Case 2: No selection – the assistant might be (a) updating the whole doc or (b) simply replying.
      const docTagStart = '<updated_document>'
      const docTagEnd = '</updated_document>'

      const startIdx = content.indexOf(docTagStart)
      const endIdx = content.indexOf(docTagEnd)

      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const newDoc = content.substring(startIdx + docTagStart.length, endIdx).trim()
        if (newDoc) {
          // send update directly to parent
          onStreamUpdate?.(newDoc, true)
          return
        }
      }

      // Otherwise treat as plain chat answer – nothing to modify in the document.
    }
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus chat input when global shortcut dispatched
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const handler = () => {
      inputRef.current?.focus()
    }
    globalThis.document.addEventListener('focus-chat-input', handler)
    return () => globalThis.document.removeEventListener('focus-chat-input', handler)
  }, [])

  // Stream draft to parent as it arrives
  useEffect(() => {
    if (!onStreamUpdate) return
    if (messages.length === 0) return
    const last = messages[messages.length - 1]
    if (last.role !== 'assistant') return

    const docTagStart = last.content.indexOf('<updated_document>')
    if (docTagStart === -1) return

    const afterStart = last.content.substring(docTagStart + '<updated_document>'.length)
    // Log the tail of the assistant message to verify end-tag arrival
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Stream tail]', last.content.slice(-200))
    }

    const docTagEndIndex = afterStart.indexOf('</updated_document>')
    let currentDraft = afterStart
    let done = false
    if (docTagEndIndex !== -1) {
      currentDraft = afterStart.substring(0, docTagEndIndex)
      done = true
    }
    onStreamUpdate(currentDraft, done)
  }, [messages, onStreamUpdate])

  return (
    <div className="w-[480px] bg-white flex flex-col h-screen fixed right-0 top-0 border-l border-neutral-border">
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-neutral-border bg-default-background">
        {/* First Row - Title and Actions */}
        <div className="flex items-center gap-">
          <span className="text-sm font-medium text-default-font">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            size="small"
            variant="neutral-tertiary"
            icon={<Share className="w-4 h-4" />}
          />
          <IconButton
            size="small"
            variant="neutral-tertiary"
            icon={<MoreHorizontal className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="flex flex-col h-full">
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-sm text-gray-600 max-w-[200px]">
                  Let me know how I can assist with your docs.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => {
                  const formattedMessage = formatMessageContent(message.content)
                  
                  return (
                    <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`flex items-start gap-3 max-w-[85%] ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                        {message.role === 'assistant' ? (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-gray-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.role === 'assistant' 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {formattedMessage.type === 'planning' ? (
                            <div className="space-y-3">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkle className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">Planning Step</span>
                                </div>
                                <pre className="text-xs text-blue-900 whitespace-pre-wrap font-mono bg-blue-100 p-2 rounded border">
                                  {formattedMessage.planningContent}
                                </pre>
                              </div>
                              {formattedMessage.statusUpdates && (
                                <p className="text-sm whitespace-pre-wrap text-gray-600">{formattedMessage.statusUpdates}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{formattedMessage.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="rounded-2xl px-4 py-2 bg-gray-100">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-gray-100">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Chat with me..."
                disabled={isLoading}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                  }
                }}
                className="w-full rounded-xl border border-gray-200 pl-4 pr-12 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                ref={inputRef}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500">
                AI can make mistakes. Always double check the source.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}