"use client"

import React, { useEffect, useRef, useState } from 'react'
import { DocumentViewer } from '@/components/DocViewer'
import NotionSidebar from '@/components/Sidebar'

interface HistoryItem {
  id: string
  timestamp: Date
  originalText: string
  newText: string
  transformation: string
  range?: { start: number; end: number }
}

const sampleDocument = `# The Future of Remote Work

Remote work has transformed from a temporary solution to a permanent fixture in modern business. This shift represents one of the most significant changes in workplace culture in decades.

## Key Benefits

**Flexibility and Work-Life Balance**
Employees can structure their day around personal commitments while maintaining productivity. This flexibility leads to higher job satisfaction and reduced burnout rates.

**Global Talent Access**
Companies are no longer limited by geographic boundaries when hiring. This opens up opportunities to find the best talent regardless of location.

**Cost Savings**
Both employers and employees benefit financially. Companies save on office space while employees save on commuting costs and time.

## Challenges to Address

**Communication Barriers**
Without face-to-face interaction, teams must be intentional about communication. Regular video calls and clear documentation become essential.

**Work-Life Boundaries**
The line between work and personal life can blur when your home is your office. Setting clear boundaries is crucial for mental health.

**Team Building**
Creating a cohesive team culture requires creativity when team members rarely meet in person. Virtual team-building activities and occasional in-person gatherings help bridge this gap.

## Best Practices for Success

1. **Establish Clear Expectations** - Set specific working hours and response times
2. **Invest in Technology** - Provide teams with the tools they need to collaborate effectively
3. **Focus on Results** - Measure performance by output rather than hours logged
4. **Prioritize Mental Health** - Encourage breaks and provide resources for employee wellbeing
5. **Create Connection Opportunities** - Schedule regular virtual coffee chats and team meetings

## Looking Ahead

The future of work is hybrid. Companies that embrace flexibility while maintaining strong cultures will thrive. As technology continues to evolve, remote work will become even more seamless and productive.

*The key is finding the right balance for your organization and continuously adapting based on team feedback and changing needs.*`

const MAX_HISTORY_LENGTH = 20

function limitHistory(history: HistoryItem[]): HistoryItem[] {
  return history.length > MAX_HISTORY_LENGTH ? history.slice(0, MAX_HISTORY_LENGTH) : history
}

export default function Home() {
  // Start with the baked-in sample document during SSR to avoid
  // mismatching markup, then replace with the persisted version
  // on the client after hydration.
  const [docContent, setDocContent] = useState(sampleDocument)

  // Load stored content on first client render
  useEffect(() => {
    const stored = localStorage.getItem('docContent')
    if (stored) setDocContent(stored)
  }, [])

  const [chatDraftText, setChatDraftText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem('history')
    const parsed = raw
      ? JSON.parse(raw, (k, v) => {
          if (k === 'timestamp') return new Date(v)
          return v
        })
      : []
    return limitHistory(parsed)
  })
  const viewerRef = useRef<HTMLDivElement>(null)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)

  // Persist on change
  useEffect(() => {
    localStorage.setItem('docContent', docContent)
  }, [docContent])
  useEffect(() => {
    // Persist history but guard against localStorage quota errors
    try {
      localStorage.setItem('history', JSON.stringify(history))
    } catch (err: unknown) {
      // Attempt a trimmed write to stay below the 5 MB quota
      try {
        const trimmed = limitHistory(history)
        localStorage.setItem('history', JSON.stringify(trimmed))
      } catch {
        // Giving up – but avoid crashing the app
        console.warn('Unable to persist history, storage quota exceeded.')
      }
    }
  }, [history])

  const handleAddToChat = (text: string, start: number, end: number) => {
    setChatDraftText(text)
    setSelectionRange({ start, end })
  }

  const handleQuickAction = async (action: string, text: string, start: number, end: number) => {
    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, context: { selectedText: text, fullDocument: docContent } })
      })
      if (!res.ok || !res.body) return

      // stream plain text
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let snippet = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        snippet += decoder.decode(value)
      }

      // fallback if empty
      if (!snippet.trim()) snippet = text

      const newDoc = docContent.substring(0, start) + snippet + docContent.substring(end)

      // commit immediately
      setDocContent(newDoc)
      setHistory(prev => limitHistory([{
        id: Date.now().toString(),
        timestamp: new Date(),
        originalText: docContent,
        newText: newDoc,
        transformation: action
      }, ...prev]))
    } catch (err) {
      console.error('quick action error', err)
    }
    // clear selection
    window.getSelection()?.removeAllRanges()
  }

  // Free-form prompt editing
  const handleCustomPrompt = async (
    prompt: string,
    text: string,
    start: number,
    end: number
  ) => {
    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'custom',
          customPrompt: prompt,
          context: { selectedText: text, fullDocument: docContent }
        })
      })
      if (!res.ok || !res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let snippet = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        snippet += decoder.decode(value)
      }

      if (!snippet.trim()) snippet = text

      const newDoc = docContent.substring(0, start) + snippet + docContent.substring(end)

      setDocContent(newDoc)
      setHistory(prev => limitHistory([{
        id: Date.now().toString(),
        timestamp: new Date(),
        originalText: docContent,
        newText: newDoc,
        transformation: 'custom'
      }, ...prev]))
    } catch (err) {
      console.error('custom prompt error', err)
    }
    window.getSelection()?.removeAllRanges()
  }

  const handleStreamUpdate = (draft: string, done: boolean) => {
    if (!done) {
      setStreamingContent(draft)
    } else {
      setStreamingContent(null)
      // commit new content directly (undo/redo removed)
      setDocContent(draft)
      setHistory(prev => {
        const updated = [
          {
            id: Date.now().toString(),
            timestamp: new Date(),
            originalText: docContent,
            newText: draft,
            transformation: 'full-update'
          },
          ...prev
        ]
        return limitHistory(updated)
      })
    }
  }

  // Global shortcut to toggle sidebar and focus chat (Cmd/Ctrl K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setSidebarVisible(v => !v)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('focus-chat-input'))
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="pr-80 max-w-none mx-auto px-12 py-8" ref={viewerRef}>
        <DocumentViewer
          content={streamingContent ?? docContent}
          title="Document"
          time={null}
          isTransforming={!!streamingContent}
          className=""
          editable={true}
          onContentChange={setDocContent}
        />
        {/* Quick actions UI removed */}
      </div>

      {/* Fixed Right Sidebar */}
      {sidebarVisible && (
        <NotionSidebar
          selectedText=""
          chatDraftText={chatDraftText}
          selectionRange={selectionRange}
          editHistory={history}
          document={docContent}
          onStreamUpdate={handleStreamUpdate}
        />
      )}
    </div>
  )
} 