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
    
    // Step 1: Generate edit instructions using OpenAI client
    const editGenStartTime = Date.now()
    
    let editInstructions = '';
    if (openaiClient) {
      try {
        // Use OpenAI to generate edit instructions
        const editResponse = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a text editor. Generate clear, specific instructions for how to transform the given text. Be concise but precise about what changes to make.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nOriginal text: "${selectedText}"`
            }
          ],
          temperature: 0.1,
        });
        editInstructions = editResponse.choices[0]?.message?.content || `${prompt} ${selectedText}`;
      } catch (error) {
        console.log('OpenAI API call failed, falling back to mock transformation:', error.message);
        // Fallback to mock transformation if API fails
        editInstructions = `${prompt} ${selectedText}`;
      }
    } else {
      // Fallback if no API key
      editInstructions = `${prompt} ${selectedText}`;
    }
    
    const editGenerationTime = Date.now() - editGenStartTime

    // Step 2: Transform the selected text using mock (for demo purposes)
    const transformedText = transformText(selectedText, transformation)

    // Step 3: Apply edits using Morph's proper API format
    const applyStartTime = Date.now()
    
    let updatedDocument = fullDocument;
    if (morphClient) {
      try {
        // Use Morph's proper format: <code>original</code><update>edit_instructions</update>
        const morphResponse = await morphClient.chat.completions.create({
          model: 'morph-v2',
          messages: [
            {
              role: 'user',
              content: `<code>${fullDocument}</code>\n<update>Replace "${selectedText}" with "${transformedText}"</update>`
            }
          ]
        });
        
        updatedDocument = morphResponse.choices[0]?.message?.content || updatedDocument;
      } catch (error) {
        console.log('Morph API call failed, falling back to manual application:', error.message);
        // Fallback to manual document reconstruction
        updatedDocument = await morphFastEdit(fullDocument, selectedText, transformedText, selectionStart, selectionEnd);
      }
    } else {
      // Fallback if no Morph API key
      updatedDocument = await morphFastEdit(fullDocument, selectedText, transformedText, selectionStart, selectionEnd);
    }
    
    const applicationTime = Date.now() - applyStartTime
    const totalTime = Date.now() - startTime

    console.log(`Morph transformation completed in ${totalTime}ms (Edit gen: ${editGenerationTime}ms, Morph apply: ${applicationTime}ms)`)

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

 