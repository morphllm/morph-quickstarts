import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { generateSharedDemoTransformation } from '../../../lib/shared-transformations';
import { highlightEdits } from '../../../lib/highlightEdits';

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

// Fast document builder for optimized text replacement (same as OpenAI route)
class FastDocumentBuilder {
  private parts: string[] = [];
  
  constructor(
    private fullDocument: string,
    private selectionStart: number,
    private selectionEnd: number
  ) {
    this.parts.push(fullDocument.substring(0, selectionStart));
    this.parts.push(''); // Placeholder for transformed text
    this.parts.push(fullDocument.substring(selectionEnd));
  }
  
  updateTransformedText(transformedText: string): string {
    this.parts[1] = transformedText;
    return this.parts.join('');
  }
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
    
    // Step 1: Generate transformed text (identical to OpenAI route)
    const editGenStartTime = Date.now()
    
    let transformedText = selectedText;
    if (openaiClient) {
      try {
        // Use OpenAI to directly transform the text (same as OpenAI route)
        const transformResponse = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a text editor. Apply the given transformation to transform the text. Return only the transformed text, nothing else.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nOriginal text: "${selectedText}"`
            }
          ],
          temperature: 0.1,
        });
        transformedText = transformResponse.choices[0]?.message?.content?.trim() || selectedText;
      } catch (error) {
        console.log('OpenAI transformation failed, falling back to mock:', error.message);
        // Fallback to mock transformation if API fails
        transformedText = transformText(selectedText, transformation);
      }
    } else {
      // Fallback if no API key
      transformedText = transformText(selectedText, transformation);
    }
    
    const editGenerationTime = Date.now() - editGenStartTime

    // Step 2: Apply edits using Morph's proper API format or fallback
    const applyStartTime = Date.now()
    let usedMorphAPI = false;
    let applicationTime = 0;
    
    let updatedDocument = fullDocument;
    if (morphClient) {
      try {
        console.log('🚀 Starting Morph API call...');
        const morphApiCallStart = Date.now();
        
        // Create proper edit instructions using the format from Morph documentation
        // Find the context around the selected text to create proper edit markers
        const beforeContext = fullDocument.substring(Math.max(0, selectionStart - 100), selectionStart);
        const afterContext = fullDocument.substring(selectionEnd, Math.min(fullDocument.length, selectionEnd + 100));
        
        // Create the update instructions in the proper format with context
        const editInstructions = `// ... existing code ...
${beforeContext}${transformedText}${afterContext}
// ... existing code ...`;
        
        // Use Morph's proper format: <code>original</code><update>edit_instructions</update>
        const morphResponse = await morphClient.chat.completions.create({
          model: 'morph-v2',
          messages: [
            {
              role: 'user',
              content: `<code>${fullDocument}</code>\n<update>${editInstructions}</update>`
            }
          ],
          timeout: 5000
        });
        
        const morphApiCallTime = Date.now() - morphApiCallStart;
        console.log(`✅ Morph API call successful in ${morphApiCallTime}ms`);
        updatedDocument = morphResponse.choices[0]?.message?.content || updatedDocument;
        applicationTime = morphApiCallTime;
        usedMorphAPI = true;
      } catch (error) {
        const morphApiCallTime = Date.now() - morphApiCallStart;
        console.log(`❌ Morph API call failed in ${morphApiCallTime}ms:`, error.message);
        
        // Use the fallback method - FastDocumentBuilder
        console.log('🔧 Using FastDocumentBuilder fallback...');
        const fallbackStart = Date.now();
        const documentBuilder = new FastDocumentBuilder(fullDocument, selectionStart, selectionEnd);
        updatedDocument = documentBuilder.updateTransformedText(transformedText);
        const fallbackTime = Date.now() - fallbackStart;
        console.log(`🔧 Fallback completed in ${fallbackTime}ms`);
        
        applicationTime = fallbackTime;
        usedMorphAPI = false;
      }
    } else {
      console.log('⚠️ No Morph API key, using FastDocumentBuilder fallback...');
      const fallbackStart = Date.now();
      const documentBuilder = new FastDocumentBuilder(fullDocument, selectionStart, selectionEnd);
      updatedDocument = documentBuilder.updateTransformedText(transformedText);
      const fallbackTime = Date.now() - fallbackStart;
      console.log(`⚠️ Fallback completed in ${fallbackTime}ms`);
      applicationTime = fallbackTime;
      usedMorphAPI = false;
    }
    
    // Create highlighted version of the document
    const highlightedDocument = highlightEdits(
      updatedDocument, 
      fullDocument, 
      selectionStart, 
      selectionEnd, 
      transformedText
    );
    
    // Total server-side processing time
    const totalTime = Date.now() - startTime

    console.log(`Morph transformation completed in ${totalTime}ms (Edit gen: ${editGenerationTime}ms, Morph apply: ${applicationTime}ms) [API: ${usedMorphAPI ? 'SUCCESS' : 'FAILED/MISSING'}]`)

    return NextResponse.json({
      updatedDocument,
      originalDocument: fullDocument,
      selectedText,
      transformedText,
      editInstructions: prompt,
      highlightedDocument,
      timing: {
        editGenerationTime,
        applicationTime,
        totalTime, // This will be replaced by the client-side total time
      },
      usedMorphAPI,
      morphApiStatus: usedMorphAPI ? 'API_SUCCESS' : (morphClient ? 'API_FAILED' : 'NO_API_KEY'),
    })

  } catch (error) {
    console.error('Morph API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process transformation' },
      { status: 500 }
    )
  }
}

 