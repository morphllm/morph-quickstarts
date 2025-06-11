'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { Badge } from '@/components/ui/badge';

// Utility functions for document stats
const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const getCharacterCount = (text: string): number => {
  return text.length;
};

const getReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = getWordCount(text);
  return Math.ceil(wordCount / wordsPerMinute);
};
import dynamic from 'next/dynamic';

// Dynamically import the diff viewer to avoid SSR issues
const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), {
  ssr: false,
  loading: () => <div>Loading diff...</div>
});

export interface TimingInfo {
  editGenerationTime?: number;
  applicationTime?: number;
  totalTime: number;
}

interface DocumentViewerProps {
  content: string;
  title: string;
  time: number | null;
  timing?: TimingInfo;
  isTransforming: boolean;
  className?: string;
  showDiff?: boolean;
  originalContent?: string;
}

export function DocumentViewer({ 
  content, 
  title, 
  time, 
  timing,
  isTransforming, 
  className,
  showDiff = false,
  originalContent 
}: DocumentViewerProps) {
  const stats = {
    words: content ? getWordCount(content) : 0,
    characters: content ? getCharacterCount(content) : 0,
    readingTime: content ? getReadingTime(content) : 0,
  };

  const renderTimingInfo = () => {
    if (timing && timing.totalTime) {
      return (
        <div className="flex items-center space-x-2 text-xs">
          {timing.editGenerationTime !== undefined && timing.editGenerationTime > 0 && (
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              Edit: {timing.editGenerationTime}ms
            </Badge>
          )}
          {timing.applicationTime !== undefined && timing.applicationTime > 0 && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Apply: {timing.applicationTime}ms
            </Badge>
          )}
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 text-xs font-medium">
            Total: {timing.totalTime}ms
          </Badge>
        </div>
      );
    }
    
    if (time !== null && time > 0) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 text-xs font-medium">
          {time}ms
        </Badge>
      );
    }
    
    return null;
  };

  const showDiffView = useMemo(() => {
    return showDiff && originalContent && content !== originalContent && content.trim() !== '';
  }, [showDiff, originalContent, content]);

  const renderContent = () => {
    // Show placeholder for empty content
    if (!content || content.trim() === '') {
      return (
        <div className="flex items-center justify-center h-full min-h-[600px]">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-medium mb-2">Ready for Transformation</h3>
            <p className="text-sm">Select a transformation from the options below to see the results</p>
          </div>
        </div>
      );
    }

    if (showDiffView) {
      return (
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Changes from original document:
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <ReactDiffViewer
              oldValue={originalContent || ''}
              newValue={content}
              splitView={false}
              hideLineNumbers={true}
              styles={{
                variables: {
                  dark: {
                    diffViewerBackground: 'hsl(var(--background))',
                    diffViewerColor: 'hsl(var(--foreground))',
                    addedBackground: 'rgba(34, 197, 94, 0.1)',
                    addedColor: 'hsl(var(--foreground))',
                    removedBackground: 'rgba(239, 68, 68, 0.1)',
                    removedColor: 'hsl(var(--foreground))',
                    wordAddedBackground: 'rgba(34, 197, 94, 0.2)',
                    wordRemovedBackground: 'rgba(239, 68, 68, 0.2)',
                    addedGutterBackground: 'rgba(34, 197, 94, 0.1)',
                    removedGutterBackground: 'rgba(239, 68, 68, 0.1)',
                    gutterBackground: 'hsl(var(--muted))',
                    gutterBackgroundDark: 'hsl(var(--muted))',
                    highlightBackground: 'hsl(var(--muted))',
                    highlightGutterBackground: 'hsl(var(--muted))',
                    codeFoldGutterBackground: 'hsl(var(--muted))',
                    codeFoldBackground: 'hsl(var(--muted))',
                  },
                  light: {
                    diffViewerBackground: 'hsl(var(--background))',
                    diffViewerColor: 'hsl(var(--foreground))',
                    addedBackground: 'rgba(34, 197, 94, 0.1)',
                    addedColor: 'hsl(var(--foreground))',
                    removedBackground: 'rgba(239, 68, 68, 0.1)',
                    removedColor: 'hsl(var(--foreground))',
                    wordAddedBackground: 'rgba(34, 197, 94, 0.2)',
                    wordRemovedBackground: 'rgba(239, 68, 68, 0.2)',
                    addedGutterBackground: 'rgba(34, 197, 94, 0.1)',
                    removedGutterBackground: 'rgba(239, 68, 68, 0.1)',
                    gutterBackground: 'hsl(var(--muted))',
                    gutterBackgroundDark: 'hsl(var(--muted))',
                    highlightBackground: 'hsl(var(--muted))',
                    highlightGutterBackground: 'hsl(var(--muted))',
                    codeFoldGutterBackground: 'hsl(var(--muted))',
                    codeFoldBackground: 'hsl(var(--muted))',
                  }
                }
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        'w-full min-h-[600px]',
        'prose prose-lg prose-zinc max-w-none dark:prose-invert',
        'text-foreground'
      )}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({children}) => (
              <h1 className="text-3xl font-bold text-foreground mb-4 mt-8 leading-tight">
                {children}
              </h1>
            ),
            h2: ({children}) => (
              <h2 className="text-2xl font-semibold text-foreground mb-3 mt-6 leading-tight">
                {children}
              </h2>
            ),
            h3: ({children}) => (
              <h3 className="text-xl font-medium text-foreground mb-2 mt-4 leading-tight">
                {children}
              </h3>
            ),
            p: ({children}) => (
              <p className="text-base text-foreground leading-relaxed mb-3">
                {children}
              </p>
            ),
            ul: ({children}) => (
              <ul className="mb-4 pl-6 list-disc">
                {children}
              </ul>
            ),
            ol: ({children}) => (
              <ol className="mb-4 pl-6 list-decimal">
                {children}
              </ol>
            ),
            li: ({children}) => (
              <li className="text-base text-foreground leading-relaxed mb-1">
                {children}
              </li>
            ),
            blockquote: ({children}) => (
              <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground my-4">
                {children}
              </blockquote>
            ),
            strong: ({children}) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
            em: ({children}) => (
              <em className="italic">
                {children}
              </em>
            ),
            code: ({children}) => (
              <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ),
          }}
        >
          {content || "No content available"}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full bg-muted/30', className)}>
      {/* Header */}
      <div className="px-6 py-3 border-b border-border bg-background">
        {/* First Row - Title and Stats */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-sm font-medium text-foreground">
              {title}
            </h1>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{stats.words} words</span>
              <span>•</span>
              <span>{stats.characters} chars</span>
              <span>•</span>
              <span>{stats.readingTime} min</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isTransforming && (
              <div className="flex items-center space-x-2 text-sm text-primary">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Transforming...</span>
              </div>
            )}
          </div>
        </div>

        {/* Second Row - Timing Information */}
        {!isTransforming && (timing || time !== null) && (
          <div className="flex items-center justify-between bg-muted/50 -mx-6 px-6 py-2 border-t border-border/50">
            <div className="text-xs font-medium text-muted-foreground">
              ⚡ Performance Metrics:
            </div>
            <div className="flex items-center space-x-2">
              {renderTimingInfo()}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="max-w-full mx-auto px-6 py-6 h-full">
          <div className="bg-background rounded-lg p-6 shadow-sm border border-border h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 