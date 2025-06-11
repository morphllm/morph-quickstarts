"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SelectableTextProps {
  content: string
  onTransform: (selectedText: string, transformation: string, fullDocument: string, selectionStart: number, selectionEnd: number) => void
}

const transformations = [
  { id: 'improve', label: '✨ Improve writing', description: 'Make it clearer and more engaging' },
  { id: 'shorten', label: '📝 Make shorter', description: 'Condense while keeping key points' },
  { id: 'expand', label: '📚 Make longer', description: 'Add more detail and context' },
  { id: 'simplify', label: '🔍 Simplify', description: 'Use simpler language' },
  { id: 'professional', label: '💼 Make professional', description: 'Professional tone and style' },
  { id: 'casual', label: '😊 Make casual', description: 'Friendly and conversational' },
]

export default function SelectableText({ content, onTransform }: SelectableTextProps) {
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ start: number, end: number } | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)

  // Function to get text position in the full document
  const getTextPosition = (range: Range): { start: number, end: number } => {
    if (!contentRef.current) return { start: 0, end: 0 }
    
    const fullText = contentRef.current.textContent || ''
    const beforeRange = document.createRange()
    beforeRange.selectNodeContents(contentRef.current)
    beforeRange.setEnd(range.startContainer, range.startOffset)
    
    const start = beforeRange.toString().length
    const end = start + range.toString().length
    
    return { start, end }
  }

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        setSelectedText('')
        setSelectionRange(null)
        setPopoverOpen(false)
        return
      }

      const range = selection.getRangeAt(0)
      const text = range.toString().trim()
      
      if (text && contentRef.current?.contains(range.commonAncestorContainer)) {
        setSelectedText(text)
        
        // Get the position in the full document
        const position = getTextPosition(range)
        setSelectionRange(position)
        
        // Get the position of the selection for popover
        const rect = range.getBoundingClientRect()
        setPopoverPosition({
          x: rect.right + 10, // Position to the right of selection with 10px margin
          y: rect.top + window.scrollY // Align with the top of selection
        })
        
        setPopoverOpen(true)
      } else {
        setSelectedText('')
        setSelectionRange(null)
        setPopoverOpen(false)
      }
    }

    document.addEventListener('selectionchange', handleSelection)
    return () => document.removeEventListener('selectionchange', handleSelection)
  }, [])

  const handleTransform = (transformationType: string) => {
    if (selectedText && selectionRange) {
      onTransform(selectedText, transformationType, content, selectionRange.start, selectionRange.end)
      setPopoverOpen(false)
      setSelectedText('')
      setSelectionRange(null)
      // Clear selection
      window.getSelection()?.removeAllRanges()
    }
  }

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className="prose prose-sm max-w-none leading-relaxed text-gray-700 select-text cursor-text p-4 rounded-lg border bg-white"
        style={{ userSelect: 'text' }}
      >
        {content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      {popoverOpen && selectedText && (
        <div
          className="fixed z-50"
          style={{
            left: Math.min(popoverPosition.x, window.innerWidth - 320 - 20), // Ensure popover stays on screen
            top: popoverPosition.y,
          }}
        >
          <Card className="w-80 p-2 shadow-lg border bg-white">
            <div className="mb-2 px-2 py-1">
              <div className="text-xs text-gray-500 mb-1">Transform selected text:</div>
              <div className="text-sm bg-blue-50 p-2 rounded text-blue-900 max-h-20 overflow-y-auto">
                "{selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}"
              </div>
            </div>
            <div className="space-y-1">
              {transformations.map((transform) => (
                <Button
                  key={transform.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-2 text-left"
                  onClick={() => handleTransform(transform.id)}
                >
                  <div>
                    <div className="font-medium text-sm">{transform.label}</div>
                    <div className="text-xs text-gray-500">{transform.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 