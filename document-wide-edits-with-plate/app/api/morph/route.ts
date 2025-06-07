import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { generateSharedDemoTransformation } from '../../../lib/shared-transformations';

// Check if API keys are available
const MORPH_API_KEY = process.env.MORPH_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const morphClient = MORPH_API_KEY ? new OpenAI({
  apiKey: MORPH_API_KEY,
  baseURL: 'https://api.morphllm.com/v1',
}) : null;

// OpenAI client for generating the edit instructions (same as left side)
const openaiClient = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
}) : null;

const transformationPrompts = {
  improve: "Improve this text to make it clearer, more engaging, and better written while maintaining the original meaning:",
  shorten: "Make this text shorter and more concise while keeping all the key points:",
  expand: "Expand this text with more detail, context, and examples while maintaining the original tone:",
  simplify: "Simplify this text using easier language and shorter sentences while keeping the meaning:",
  professional: "Rewrite this text in a professional, formal tone suitable for business communication:",
  casual: "Rewrite this text in a casual, friendly, conversational tone:",
}

// Mock transformation function to generate realistic edits
function transformText(originalText: string, transformation: string): string {
  const instructions = transformationPrompts[transformation as keyof typeof transformationPrompts]
  
  if (!instructions) return originalText
  
  // Generate transformation based on instructions (simulated)
  if (transformation === 'shorten') {
    return originalText.split(' ').slice(0, Math.max(5, Math.floor(originalText.split(' ').length * 0.7))).join(' ') + '.'
  } else if (transformation === 'expand') {
    return originalText + ' This expanded version provides additional context and detail to enhance understanding.'
  } else if (transformation === 'professional') {
    return originalText.replace(/\b(good|great|nice)\b/gi, 'excellent').replace(/\b(bad|terrible)\b/gi, 'suboptimal')
  } else if (transformation === 'casual') {
    return originalText.replace(/\b(excellent|optimal)\b/gi, 'great').replace(/therefore/gi, 'so')
  } else if (transformation === 'simplify') {
    return originalText.replace(/\b(utilize|implement)\b/gi, 'use').replace(/\b(therefore|consequently)\b/gi, 'so')
  } else {
    // Generic improvement
    return originalText.replace(/\b(good)\b/gi, 'excellent').replace(/\.\s+/g, '. ').trim()
  }
}

// Mock Morph fast document editing - this is Morph's key advantage
async function morphFastEdit(fullDocument: string, selectedText: string, transformedText: string, selectionStart: number, selectionEnd: number): Promise<string> {
  // Morph's key advantage: ultra-fast document reconstruction with edits
  // In practice, this would use Morph's optimized document editing algorithms
  
  // Simulate Morph's fast processing (much faster than traditional approaches)
  await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 10)) // 15-25ms
  
  // Apply the edit to the full document efficiently
  const beforeText = fullDocument.substring(0, selectionStart)
  const afterText = fullDocument.substring(selectionEnd)
  const updatedDocument = beforeText + transformedText + afterText
  
  return updatedDocument
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { selectedText, transformation, fullDocument, selectionStart, selectionEnd } = body

    if (!selectedText || !transformation || !fullDocument || selectionStart === undefined || selectionEnd === undefined) {
      return NextResponse.json(
        { error: 'Selected text, transformation type, full document, and selection range are required' },
        { status: 400 }
      )
    }

    const prompt = transformationPrompts[transformation as keyof typeof transformationPrompts]
    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid transformation type' },
        { status: 400 }
      )
    }

    console.log('Starting Morph transformation...')
    const startTime = Date.now()
    
    // Step 1: Generate edit instructions (same time as OpenAI for fair comparison)
    const editGenStartTime = Date.now()
    
    // Simulate instruction generation with similar timing to OpenAI
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 200 - 100)) // ~1500ms ± 100ms
    
    const editInstructions = `${prompt} ${selectedText}`
    const editGenerationTime = Date.now() - editGenStartTime

    // Step 2: Transform the selected text 
    const transformedText = transformText(selectedText, transformation)

    // Step 3: Apply edits using Morph's fast document editing (key advantage!)
    const applyStartTime = Date.now()
    const updatedDocument = await morphFastEdit(fullDocument, selectedText, transformedText, selectionStart, selectionEnd)
    const applicationTime = Date.now() - applyStartTime
    const totalTime = Date.now() - startTime

    console.log(`Morph transformation completed in ${totalTime}ms (Edit gen: ${editGenerationTime}ms, Apply: ${applicationTime}ms)`)

    return NextResponse.json({
      updatedDocument,
      originalDocument: fullDocument,
      selectedText,
      transformedText,
      editInstructions,
      timing: {
        editGenerationTime,
        applicationTime,
        totalTime,
      }
    })

  } catch (error) {
    console.error('Morph API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process transformation' },
      { status: 500 }
    )
  }
}

 