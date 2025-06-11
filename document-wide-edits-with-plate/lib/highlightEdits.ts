/**
 * Highlights edited text in the document by wrapping it with HTML highlight span
 */
export function highlightEdits(
  updatedDocument: string,
  originalDocument: string,
  selectionStart: number,
  selectionEnd: number,
  transformedText: string
): string {
  // Create the highlighted version by inserting highlight tags
  const beforeText = updatedDocument.substring(0, selectionStart);
  const afterText = updatedDocument.substring(selectionStart + transformedText.length);
  
  // Wrap the transformed text with highlight span
  const highlightedText = `<span class="bg-yellow-200 text-black px-1 rounded">${transformedText}</span>`;
  const rawDocument = `${beforeText}${highlightedText}${afterText}`;
  
  // Convert newlines to paragraph breaks for HTML rendering
  return rawDocument.split('\n\n').map(paragraph => 
    `<p class="mb-3 last:mb-0">${paragraph}</p>`
  ).join('');
} 