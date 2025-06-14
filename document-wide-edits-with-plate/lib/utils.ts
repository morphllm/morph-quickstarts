import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function getCharacterCount(text: string): number {
  return text.length
}

export function getReadingTime(text: string): number {
  const wordsPerMinute = 200
  const wordCount = getWordCount(text)
  return Math.ceil(wordCount / wordsPerMinute)
}
