export function createInlineDiff(original: string, updated: string): string {
  const oldLines = original.split('\n')
  const newLines = updated.split('\n')
  let i = 0
  let j = 0
  const result: string[] = []

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      result.push(oldLines[i])
      i++
      j++
      continue
    }

    if (i < oldLines.length) {
      const removed = oldLines[i]
      if (removed.trim() !== '') {
        result.push(`~~${removed}~~`)
      }
      i++
    }

    if (j < newLines.length) {
      const added = newLines[j]
      result.push(added)
      j++
    }
  }

  return result.join('\n')
} 