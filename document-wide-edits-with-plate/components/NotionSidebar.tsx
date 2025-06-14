"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare,
  Clock,
  Send,
  User,
  Bot,
  Loader2
} from 'lucide-react'
import { Button } from "@/components/ui/button"

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
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-screen fixed right-0 top-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          AI Assistant
        </h2>
        {/* theme toggle removed */}
        {selectedText && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            Selected: "{selectedText.substring(0, 30)}..."
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'chat' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'history' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 && !selectedText ? (
                <div className="text-center py-8">
                  <Bot className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Ask anything about your document or select text to edit
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="flex gap-3"
                    >
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                        message.role === 'assistant' 
                          ? 'bg-gray-100' 
                          : 'bg-blue-100'
                      }`}>
                        {message.role === 'assistant' ? (
                          <Bot className="w-4 h-4 text-gray-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`inline-block px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                          message.role === 'assistant'
                            ? 'bg-gray-50 text-gray-900'
                            : 'bg-blue-500 text-white'
                        }`}>
                          {(() => {
                            if (message.role === 'assistant' && message.content.includes('<updated_document>')) {
                              // streaming or done
                              const done = message.content.includes('</updated_document>')
                              return done ? '✅ Draft ready. Review in document pane.' : '⏳ Updating document…'
                            }
                            return message.content
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-50 px-3 py-2 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
              {chatDraftText && (
                <div className="mb-2 text-xs text-gray-500 truncate">
                  Inserted: "{chatDraftText.length > 120 ? chatDraftText.substring(0, 120) + '...' : chatDraftText}"
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder={selectedText ? "Ask something or give an edit instruction... (Enter to send, Shift+Enter for new line)" : "Ask a question about the document... (Enter to send, Shift+Enter for new line)"}
                  disabled={isLoading}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // trigger form submit
                      (e.currentTarget.form as HTMLFormElement)?.requestSubmit();
                    }
                  }}
                  className="flex-1 resize-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  ref={inputRef}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isLoading || !input.trim()}
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            {editHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No edits yet</p>
                <p className="text-xs text-gray-400 mt-1">Changes will appear here as you edit</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                
                <div className="space-y-4">
                  {editHistory.map((edit, index) => (
                    <div key={edit.id} className="relative flex items-start">
                      {/* Timeline Dot */}
                      <div className="absolute left-2.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                      
                      {/* Content */}
                      <div className="ml-8 flex-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                                {edit.transformation}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                #{editHistory.length - index}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {edit.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          {/* Brief preview snippet */}
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                            {edit.newText.slice(0,120)}{edit.newText.length>120?'…':''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Initial state marker */}
                  <div className="relative flex items-start">
                    <div className="absolute left-2.5 w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow-sm z-10"></div>
                    <div className="ml-8 flex-1">
                      <div className="text-xs text-gray-500 py-2">
                        <span className="font-medium">Initial document</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}