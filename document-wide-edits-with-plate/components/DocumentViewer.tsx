'use client';

import React, { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { Badge } from '@/components/ui/badge';
import { createInlineDiff } from '../lib/createInlineDiff';
import rehypeRaw from 'rehype-raw';
import { Loader2 } from 'lucide-react';

// Dynamically import ReactMarkdown on client only to keep bundle lighter
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

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
  onApply?: () => void;
  onCancel?: () => void;
  highlightRange?: {start:number; end:number};
}

export function DocumentViewer({ 
  content, 
  title, 
  time, 
  timing,
  isTransforming, 
  className,
  showDiff = false,
  originalContent,
  onApply,
  onCancel,
  highlightRange
}: DocumentViewerProps) {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => {
    setHydrated(true)
  }, [])
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
      let inline: string
      if (highlightRange) {
        const { start, end } = highlightRange
        const before = originalContent?.substring(0, start) || ''
        const after = originalContent?.substring(end) || ''
        const removed = originalContent?.substring(start, end) || ''
        const added = content.substring(start, start + (content.length - (originalContent?.length || 0)) + (end - start))
        inline = before + `\n~~${removed}~~\n` + added + after
      } else {
        inline = createInlineDiff(originalContent || '', content)
      }
      return (
        <div className="relative group">
          {onApply && onCancel && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-background border border-border rounded-md shadow-lg px-2 py-1">
              <button
                onClick={onApply}
                className="px-2 py-0.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded focus:outline-none"
              >
                ✓ Accept
              </button>
              <div className="w-px h-4 bg-border" />
              <button
                onClick={onCancel}
                className="px-2 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded focus:outline-none"
              >
                ✕ Discard
              </button>
            </div>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              del: (props: any) => (
                <del className="text-red-600 bg-transparent" {...props} />
              ),
              ins: (props: any) => (
                <span className="text-green-700" {...props} />
              )
            }}
          >
            {inline}
          </ReactMarkdown>
        </div>
      )
    }

    return (
      <div className={cn('prose prose-lg max-w-none px-6', 'text-foreground')}>
        {/* @ts-ignore */}
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
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
            {hydrated && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground" suppressHydrationWarning>
                <span>{stats.words} words</span>
                <span>•</span>
                <span>{stats.characters} chars</span>
                <span>•</span>
                <span>{stats.readingTime} min</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isTransforming && (
              <div className="flex items-center space-x-2 text-sm text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
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