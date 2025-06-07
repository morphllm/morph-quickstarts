import { useState, useCallback } from 'react';
import { DOCUMENT_TRANSFORMS, API_ENDPOINTS } from '@/lib/constants';

interface TransformOptions {
  useMorph: boolean;
  stream?: boolean;
}

interface TransformState {
  isTransforming: boolean;
  progress: number;
  error: string | null;
  lastTransformation: string | null;
}

export function useDocumentTransforms() {
  const [state, setState] = useState<TransformState>({
    isTransforming: false,
    progress: 0,
    error: null,
    lastTransformation: null,
  });

  const transform = useCallback(async (
    document: string,
    transformKey: keyof typeof DOCUMENT_TRANSFORMS,
    options: TransformOptions
  ): Promise<string | null> => {
    const transformation = DOCUMENT_TRANSFORMS[transformKey];
    
    setState(prev => ({
      ...prev,
      isTransforming: true,
      progress: 0,
      error: null,
      lastTransformation: transformation.name,
    }));

    try {
      const endpoint = options.useMorph ? API_ENDPOINTS.MORPH : API_ENDPOINTS.OPENAI;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document,
          transformation: transformation.prompt,
          stream: options.stream || false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      if (options.stream) {
        return handleStreamingResponse(response);
      } else {
        setState(prev => ({ ...prev, progress: 50 }));
        const result = await response.text();
        setState(prev => ({ ...prev, progress: 100 }));
        
        setTimeout(() => {
          setState(prev => ({ ...prev, isTransforming: false, progress: 0 }));
        }, 500);

        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isTransforming: false,
        progress: 0,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const handleStreamingResponse = async (response: Response): Promise<string> => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    let progressCount = 0;

    if (!reader) {
      throw new Error('No reader available for streaming response');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        
        // Update progress based on content length (rough estimation)
        progressCount += chunk.length;
        const estimatedProgress = Math.min(90, (progressCount / 100) * 10);
        setState(prev => ({ ...prev, progress: estimatedProgress }));
      }

      setState(prev => ({ ...prev, progress: 100 }));
      
      setTimeout(() => {
        setState(prev => ({ ...prev, isTransforming: false, progress: 0 }));
      }, 500);

      return accumulated;
    } finally {
      reader.releaseLock();
    }
  };

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    transform,
    clearError,
    transforms: DOCUMENT_TRANSFORMS,
  };
} 