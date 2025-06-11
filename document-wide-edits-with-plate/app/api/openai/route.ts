import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { generateSharedDemoTransformation } from '../../../lib/shared-transformations';
import { highlightEdits } from '../../../lib/highlightEdits';

// Check if API key is available
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
}) : null;

const transformationPrompts = {
  improve: "Improve this text to make it clearer, more engaging, and better written while maintaining the original meaning:",
  shorten: "Make this text shorter and more concise while keeping all the key points:",
  expand: "Expand this text with more detail, context, and examples while maintaining the original tone:",
  simplify: "Simplify this text using easier language and shorter sentences while keeping the meaning:",
  professional: "Rewrite this text in a professional, formal tone suitable for business communication:",
  casual: "Rewrite this text in a casual, friendly, conversational tone:",
};

// Fast document builder for optimized text replacement
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
    const body = await request.json();
    const { selectedText, transformation, fullDocument, selectionStart, selectionEnd } = body;

    if (!selectedText || !transformation || !fullDocument || selectionStart === undefined || selectionEnd === undefined) {
      return NextResponse.json(
        { error: 'Selected text, transformation type, full document, and selection range are required' },
        { status: 400 }
      );
    }

    const prompt = transformationPrompts[transformation as keyof typeof transformationPrompts];
    if (!prompt) {
      return NextResponse.json(
        { error: 'Invalid transformation type' },
        { status: 400 }
      );
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    console.log('Starting OpenAI transformation...');
    const startTime = Date.now();
    
    // Step 1: Generate transformed text
    const editGenStartTime = Date.now();

    let transformedSnippet = selectedText;
    if (openai) {
      try {
        const transformResponse = await openai.chat.completions.create({
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
        transformedSnippet = transformResponse.choices[0]?.message?.content?.trim() || selectedText;
      } catch (error) {
        console.log('OpenAI transformation failed, using original text:', error.message);
        transformedSnippet = selectedText;
      }
    }

    const editGenerationTime = Date.now() - editGenStartTime;

    // Step 2: Apply the edit to the full document (optimized approach)
    const applyStartTime = Date.now();
    
    // Use FastDocumentBuilder for optimized document reconstruction
    const documentBuilder = new FastDocumentBuilder(fullDocument, selectionStart, selectionEnd);
    const updatedDocument = documentBuilder.updateTransformedText(transformedSnippet);
    
    // Create highlighted version of the document
    const highlightedDocument = highlightEdits(
      updatedDocument, 
      fullDocument, 
      selectionStart, 
      selectionEnd, 
      transformedSnippet
    );
    
    const applicationTime = Date.now() - applyStartTime;
    
    // Total server-side processing time
    const totalTime = Date.now() - startTime;

    console.log(`OpenAI transformation completed in ${totalTime}ms (Edit gen: ${editGenerationTime}ms, Apply: ${applicationTime}ms)`);

    return NextResponse.json({
      updatedDocument,
      originalDocument: fullDocument,
      selectedText,
      transformedText: transformedSnippet,
      editInstructions: prompt,
      highlightedDocument,
      timing: {
        editGenerationTime,
        applicationTime,
        totalTime, // This will be replaced by the client-side total time
      }
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process transformation' },
      { status: 500 }
    );
  }
}

 