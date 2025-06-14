import React, { useEffect, useRef, useState } from 'react'
import { useFloating, offset, shift, flip, autoUpdate, useDismiss, useClick, useInteractions, FloatingPortal } from '@floating-ui/react'

interface SelectionPopoverProps {
  /** Container element that owns the selectable text (DocumentViewer wrapper) */
  containerRef: React.RefObject<HTMLElement>
  onAddToChat?: (text: string, start: number, end: number) => void
  onQuickAction?: (action: string, text: string, start: number, end: number) => void
  onCustomPrompt?: (prompt: string, text: string, start: number, end: number) => void
}

export default function SelectionPopover({ containerRef, onAddToChat, onQuickAction, onCustomPrompt }: SelectionPopoverProps) {
  const [open, setOpen] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [inputValue, setInputValue] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(8), flip(), shift({ padding: 5 })],
    whileElementsMounted: autoUpdate,
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)
  const { getFloatingProps } = useInteractions([click, dismiss])

  // Listen for selection changes inside the container
  useEffect(() => {
    function handleMouseUp() {
      if (!containerRef.current) return
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        setOpen(false)
        return
      }
      const range = selection.getRangeAt(0)
      if (!range.toString().trim()) {
        setOpen(false)
        return
      }
      // Ensure selection lies inside our container
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        setOpen(false)
        return
      }
      const rect = range.getBoundingClientRect()
      // Save text & show popover
      const text = range.toString()
      setSelectedText(text)
      // Determine character offsets within container textContent
      const preRange = range.cloneRange()
      preRange.selectNodeContents(containerRef.current)
      preRange.setEnd(range.startContainer, range.startOffset)
      const startIdx = preRange.toString().length
      const endIdx = startIdx + text.length
      setOpen(true)
      // Position reference element (virtual)
      const virtualEl = {
        getBoundingClientRect: () => rect,
        contextElement: containerRef.current,
      } as any
      refs.setReference(virtualEl)

      // Focus input when popover opens
      setTimeout(() => inputRef.current?.focus(), 0)
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [containerRef, refs])

  // Helper to get offsets relative to container
  const getOffsets = (): [number, number] | null => {
    if (!containerRef.current) return null
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null
    const range = selection.getRangeAt(0)
    const pre = range.cloneRange()
    pre.selectNodeContents(containerRef.current)
    pre.setEnd(range.startContainer, range.startOffset)
    const s = pre.toString().length
    const e = s + range.toString().length
    return [s, e]
  }

  // Suggested actions (grouped)
  const suggested = [
    { id: 'improve', label: 'Improve writing' },
    { id: 'fix-grammar', label: 'Fix spelling & grammar' },
    { id: 'translate', label: 'Translate to' },
  ]

  const editActions = [
    { id: 'shorten', label: 'Make shorter' },
    { id: 'change-tone', label: 'Change tone' },
    { id: 'simplify', label: 'Simplify language' },
    { id: 'expand', label: 'Make longer' },
  ]

  const triggerAction = (id: string) => {
    const offsets = getOffsets()
    if (!offsets) return
    const [s, e] = offsets
    if (onQuickAction) {
      onQuickAction(id, selectedText, s, e)
    }
    window.getSelection()?.removeAllRanges()
    setOpen(false)
  }

  const submitPrompt = () => {
    if (!inputValue.trim()) return
    const offsets = getOffsets()
    if (!offsets) return
    const [s, e] = offsets
    if (onCustomPrompt) {
      onCustomPrompt(inputValue.trim(), selectedText, s, e)
    }
    window.getSelection()?.removeAllRanges()
    setInputValue('')
    setOpen(false)
  }

  if (!open) return null

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className="z-50 w-80"
      >
        <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-xl">
          {/* Input */}
          <div className="px-3 pt-3">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submitPrompt()
                }
                if (e.key === 'Escape') {
                  setOpen(false)
                }
              }}
              placeholder="Ask AI anything…"
              className="w-full text-sm px-2 py-1.5 border border-input rounded-md outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Suggestions */}
          <div className="mt-2 max-h-64 overflow-auto py-1">
            {/* Suggested group */}
            <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">Suggested</div>
            {suggested.map(a => (
              <button
                key={a.id}
                onClick={() => triggerAction(a.id)}
                className="flex w-full items-center justify-between text-left text-sm px-3 py-1.5 hover:bg-muted"
              >
                {a.label}
                <span className="text-muted-foreground">↵</span>
              </button>
            ))}

            <div className="border-t border-border my-2" />

            <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">Edit</div>
            {editActions.map(a => (
              <button
                key={a.id}
                onClick={() => triggerAction(a.id)}
                className="flex w-full items-center justify-between text-left text-sm px-3 py-1.5 hover:bg-muted"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </FloatingPortal>
  )
} 