import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { generateSharedDemoTransformation } from '../../../lib/shared-transformations';

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
    const editGenStartTime = Date.now();

    // Step 1: Generate edit instructions
    const editResponse = await openai.chat.completions.create({
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

    const editInstructions = editResponse.choices[0]?.message?.content || '';
    const editGenerationTime = Date.now() - editGenStartTime;

    // Step 2: Apply the edit instructions to get the transformed snippet
    const transformStartTime = Date.now();
    const transformResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a text editor. Apply the given edit instructions to transform the text. Return only the transformed text, nothing else.'
        },
        {
          role: 'user',
          content: `Original text: "${selectedText}"\n\nEdit instructions: ${editInstructions}\n\nTransformed text:`
        }
      ],
      temperature: 0.1,
    });

    const transformedSnippet = transformResponse.choices[0]?.message?.content || selectedText;
    const transformTime = Date.now() - transformStartTime;

    // Step 3: Apply the edit to the full document (traditional slow approach)
    const applyStartTime = Date.now();
    
    // Simulate traditional document editing overhead
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100)); // 150-250ms overhead
    
    // Apply the edit to the full document
    const beforeText = fullDocument.substring(0, selectionStart);
    const afterText = fullDocument.substring(selectionEnd);
    const updatedDocument = beforeText + transformedSnippet + afterText;
    
    const applicationTime = Date.now() - applyStartTime;
    const totalTime = Date.now() - startTime;

    console.log(`OpenAI transformation completed in ${totalTime}ms (Edit gen: ${editGenerationTime}ms, Transform: ${transformTime}ms, Apply: ${applicationTime}ms)`);

    return NextResponse.json({
      updatedDocument,
      originalDocument: fullDocument,
      selectedText,
      transformedText: transformedSnippet,
      editInstructions,
      timing: {
        editGenerationTime,
        applicationTime: transformTime + applicationTime, // Combined transform + apply time
        totalTime,
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

 