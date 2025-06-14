# Cursor-for-Docs – Development Plan

## 0. Overview
A Notion-style workspace with an AI sidebar that can answer questions about the current document **and** directly edit it.

```
┌────────────────────────────┐┌──────────────────────────────┐
│  Markdown viewer / editor  ││   AI Chat / Quick-actions    │
│  (left pane)               ││   (right pane – fixed)       │
└────────────────────────────┘└──────────────────────────────┘
```

---

## 1  Feature Roadmap

| Milestone | Items |
|-----------|-------|
| 1. Core Layout & UX | two-pane layout, theme, shortcuts |
| 2. Document Pane | markdown viewer, **selection layer**, pop-over |
| 3. Chat Sidebar | streaming chat, selection→input, quick actions |
| 4. AI Backend | prompt rules, edit vs Q&A, streaming |
| 5. History | diff list, undo |
| 6. Extras | RAG, multi-file, dark mode, etc. |

Detailed tasks (collapsed for brevity, see previous message) …

---

## 2  Current Implementation Review (2025-06-14)

| Area | Status | File(s) | Notes |
|------|--------|---------|-------|
| Two-pane layout | ✅ Done | `app/notion-demo/page.tsx` + Tailwind classes | uses `DocumentViewer` + `NotionSidebar` |
| Markdown render | ✅ | `components/DocumentViewer.tsx` | full GFM, diff view support |
| Sidebar skeleton | ✅ | `components/NotionSidebar.tsx` | chat tabs, history UI (data empty) |
| Vercel AI chat hook | ✅ | same file – `useChat` wired to `/api/openai` |
| OpenAI route | ✅ | `app/api/openai/route.ts` | streams plain text; supports selection snippets, quick-actions, and full-doc edits |
| Selection layer | ❌ Removed | (files deleted) | Will rebuild (Milestone 2) |
| Add-to-chat flow | ❌ | blocked until selection layer re-added |
| Quick actions | ⚠️ Planned |   | pop-over UI exists; backend ready; wiring pending |
| Edit-history | ⚠️ Undo works | page component | history array + undo/redo, diff basic |
| Edit-history | ✅ | page component + sidebar | quick-actions push history, undo/redo wired |
| Keyboard shortcuts | ✅ | page component | ⌘/Ctrl Z, Shift-Z, B, K |

Legend: ✅ finished ⚠️ partial ❌ not started

---

## 3  Next Steps
1. Re-introduce **selection** component (accurate range math) and contextual pop-over with "Add to chat".
2. Update `/api/openai` logic to handle selection-based edits again (return snippet only).
3. Wire quick-action buttons (summarize/improve/etc.) to backend.
4. Persist edits in local history array and render diff.
5. Global shortcuts & dark theme.
6. Persist undo/redo for edit history and wire diff highlighting more clearly.
7. Sidebar Actions tab: reuse same quick-action handler (currently still separate) or remove duplication.
8. Global keyboard shortcuts (⌘B toggle sidebar, ⌘K focus chat).
9. Dark-mode + theme switch.
10. Refactor `/api/openai` to use `streamText` helper for simplicity.

---

## 4  React State Map (vNext)

```mermaid
classDiagram
direction TB
NotionDemo --> DocumentViewer : prop `document`
NotionDemo --> SelectionPopover : refs + callbacks
NotionDemo --> NotionSidebar : `chatDraftText`, `history[]`

class NotionDemo{
  string document
  string chatDraftText
  string sel               // current highlighted text
  RangeIndices? range      // {start,end}
  HistoryItem[] history
}

class SelectionPopover{
  onAddToChat(text)
  onTransform(action,text,start,end)
}

class NotionSidebar{
  useChat() state
}
```

State keys:
- **document** – full markdown string.
- **sel/range** – only live while a highlight is active.
- **chatDraftText** – pre-filled input when user "Add to chat".
- **history** – array of edit records `{id,timestamp,originalText,newText,transformation}`.

This model will be implemented while completing Step 3.

_Assignee: open_ 

## 5  AI Streaming Notes  (from AI SDK docs)

Based on the official cookbook patterns ([Stream Text with Chat Prompt](https://ai-sdk.dev/cookbook/next/stream-text-with-chat-prompt) / [Chat with PDFs](https://ai-sdk.dev/cookbook/next/chat-with-pdf)) the **correct contract** between the Next.js route and `useChat` is:

1. **Backend**
   ```ts
   import { streamText } from 'ai'
   import { openai } from '@ai-sdk/openai'

   export async function POST(req: Request) {
     const { messages } = await req.json()

     const result = streamText({
       model: openai('gpt-4o'),
       messages,
     })

     // choose protocol – we want plain-text chunks
     return result.toTextStreamResponse()   // emits `text/plain` chunks
   }
   ```
   • `toTextStreamResponse()` automatically adds the `Content-Type: text/plain; charset=utf-8` header expected by `useChat({ streamProtocol:'text' })` (exactly what we hand-rolled earlier).
   • If we ever need advanced parts (tool calls, sources, etc.) we can switch to `toDataStreamResponse()` and drop the `streamProtocol` override on the client.

2. **Frontend**
   ```ts
   const { messages, input, handleInputChange, handleSubmit } = useChat({
     api: '/api/openai',
     streamProtocol: 'text',      // because we use toTextStreamResponse
   })
   ```

Therefore:
* Our existing `/api/openai/route.ts` still works, but we can simplify it by replacing custom `ReadableStream` code with `ai`'s `streamText` helper when we refactor.
* Plan updated – no mismatch between SDK expectations and our implementation.

--- 