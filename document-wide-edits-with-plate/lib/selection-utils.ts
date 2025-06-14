/**
 * Utility functions for handling text selection in the document editor
 */

export interface SelectionInfo {
  text: string
  start: number
  end: number
  rect: DOMRect | null
}

/**
 * Get normalized text content from an element, handling ReactMarkdown rendering
 */
export function getNormalizedText(element: HTMLElement): string {
  // Get text content and normalize whitespace
  const text = element.textContent || ''
  // Replace multiple spaces with single space, but preserve newlines
  return text.replace(/[^\S\n]+/g, ' ').trim()
}

/**
 * Find the actual position of selected text in the document
 */
export function findTextPosition(
  container: HTMLElement,
  selectedText: string,
  range: Range
): { start: number; end: number } | null {
  const fullText = getNormalizedText(container)
  const normalizedSelected = selectedText.trim()
  
  // Try to find exact match first
  let start = fullText.indexOf(normalizedSelected)
  
  // If no exact match, try to find approximate position
  if (start === -1) {
    // Get approximate position using range
    const beforeRange = document.createRange()
    beforeRange.selectNodeContents(container)
    beforeRange.setEnd(range.startContainer, range.startOffset)
    const beforeText = getNormalizedText(beforeRange.cloneContents() as unknown as HTMLElement)
    start = beforeText.length
  }
  
  if (start !== -1) {
    return {
      start,
      end: start + normalizedSelected.length
    }
  }
  
  return null
}

/**
 * Clear all text selections in the document
 */
export function clearSelection(): void {
  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
  }
}

/**
 * Check if a selection is valid (non-empty and within bounds)
 */
export function isValidSelection(selection: Selection | null): boolean {
  if (!selection || selection.rangeCount === 0) {
    return false
  }
  
  const range = selection.getRangeAt(0)
  const text = range.toString().trim()
  
  return text.length > 0
}

/**
 * Get selection information including position and bounding rect
 */
export function getSelectionInfo(container: HTMLElement): SelectionInfo | null {
  const selection = window.getSelection()
  
  if (!isValidSelection(selection)) {
    return null
  }
  
  const range = selection!.getRangeAt(0)
  const text = range.toString().trim()
  
  // Check if selection is within container
  if (!container.contains(range.commonAncestorContainer)) {
    return null
  }
  
  const position = findTextPosition(container, text, range)
  
  if (!position) {
    return null
  }
  
  return {
    text,
    start: position.start,
    end: position.end,
    rect: range.getBoundingClientRect()
  }
}

/**
 * Debounce function for selection events
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}