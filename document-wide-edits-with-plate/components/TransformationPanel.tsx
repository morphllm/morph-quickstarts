'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useDocumentTransforms } from '@/hooks/useDocumentTransforms';
import { DOCUMENT_TRANSFORMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TransformationPanelProps {
  document: string;
  onTransformComplete: (transformedContent: string) => void;
  className?: string;
}

export function TransformationPanel({ 
  document, 
  onTransformComplete, 
  className 
}: TransformationPanelProps) {
  const [useMorph, setUseMorph] = useState(true);
  const [selectedTransform, setSelectedTransform] = useState<string | null>(null);
  
  const { 
    isTransforming, 
    progress, 
    error, 
    lastTransformation,
    transform, 
    clearError 
  } = useDocumentTransforms();

  const handleTransform = async (transformKey: keyof typeof DOCUMENT_TRANSFORMS) => {
    if (!document.trim()) {
      return;
    }

    setSelectedTransform(transformKey);
    
    const result = await transform(document, transformKey, {
      useMorph,
      stream: false,
    });

    if (result) {
      onTransformComplete(result);
    }
    
    setSelectedTransform(null);
  };

  const transformEntries = Object.entries(DOCUMENT_TRANSFORMS) as [
    keyof typeof DOCUMENT_TRANSFORMS,
    typeof DOCUMENT_TRANSFORMS[keyof typeof DOCUMENT_TRANSFORMS]
  ][];

  return (
    <div className={cn(
      'w-80 bg-white border-l border-notion-gray-200 flex flex-col',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-notion-gray-200">
        <h2 className="text-lg font-semibold text-notion-gray-900 mb-4">
          AI Transformations
        </h2>
        
        {/* Morph Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-notion-sm font-medium text-notion-gray-900">
              Use Morph
            </span>
            <span className="text-xs text-notion-gray-500">
              {useMorph ? 'Lightning fast (2000+ tokens/sec)' : 'Standard OpenAI'}
            </span>
          </div>
          <Switch
            checked={useMorph}
            onCheckedChange={setUseMorph}
            disabled={isTransforming}
          />
        </div>
      </div>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isTransforming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-notion-blue-50 border-b border-notion-blue-100"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 border-2 border-notion-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <div className="text-notion-sm font-medium text-notion-blue-900">
                  {lastTransformation}
                </div>
                <div className="text-xs text-notion-blue-700">
                  {useMorph ? 'Processing with Morph...' : 'Processing with OpenAI...'}
                </div>
                {progress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-notion-blue-200 rounded-full h-1">
                      <motion.div
                        className="bg-notion-blue-600 h-1 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-red-50 border-b border-red-100"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-notion-sm font-medium text-red-900">
                  Transformation Failed
                </div>
                <div className="text-xs text-red-700 mt-1">
                  {error}
                </div>
                <button
                  onClick={clearError}
                  className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transformation Actions */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {transformEntries.map(([key, transformation]) => (
            <Button
              key={key}
              variant="ghost"
              className={cn(
                'w-full justify-start text-left h-auto p-3',
                'hover:bg-notion-gray-50 transition-colors',
                selectedTransform === key && 'bg-notion-blue-50 border-notion-blue-200',
                isTransforming && selectedTransform !== key && 'opacity-50'
              )}
              onClick={() => handleTransform(key)}
              disabled={isTransforming || !document.trim()}
            >
              <div className="flex items-start space-x-3 w-full">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {transformation.icon}
                </span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-notion-gray-900 text-sm">
                    {transformation.name}
                  </div>
                  <div className="text-xs text-notion-gray-500 mt-1 leading-relaxed">
                    {transformation.prompt.length > 100 
                      ? `${transformation.prompt.substring(0, 100)}...`
                      : transformation.prompt
                    }
                  </div>
                  <div className="text-xs text-notion-blue-600 mt-1 font-medium">
                    {useMorph ? '⚡ Morph (2000+ tokens/sec)' : '🤖 OpenAI (Standard speed)'}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-notion-gray-200 bg-notion-gray-50">
        <div className="text-xs text-notion-gray-500 text-center">
          {useMorph ? (
            <>
              <div className="font-medium text-notion-gray-700">⚡ Morph Mode</div>
              <div>Ultra-fast document transformations</div>
            </>
          ) : (
            <>
              <div className="font-medium text-notion-gray-700">🤖 OpenAI Mode</div>
              <div>Standard AI transformations</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 