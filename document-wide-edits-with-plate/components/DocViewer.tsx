'use client';

import React, { useMemo } from 'react';
import { cn } from '../lib/utils';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
// @ts-ignore – Plate v42+ exposes the React bindings under this path
import { Plate, PlateContent, usePlateEditor } from 'platejs/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import {
  HeadingPlugin,
  BlockquotePlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
} from '@platejs/basic-nodes/react';

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

// Simple markdown to Plate value converter
const parseMarkdownToPlate = (markdown: string) => {
  if (!markdown || markdown.trim() === '') {
    return [{ type: 'p', children: [{ text: '' }] }];
  }

  const lines = markdown.split('\n');
  const nodes: any[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('# ')) {
      nodes.push({
        type: 'h1',
        children: [{ text: line.slice(2) }]
      });
    } else if (line.startsWith('## ')) {
      nodes.push({
        type: 'h2',
        children: [{ text: line.slice(3) }]
      });
    } else if (line.startsWith('### ')) {
      nodes.push({
        type: 'h3',
        children: [{ text: line.slice(4) }]
      });
    } else if (line.startsWith('> ')) {
      nodes.push({
        type: 'blockquote',
        children: [{ text: line.slice(2) }]
      });
    } else if (line.trim() === '') {
      // Skip empty lines
      continue;
    } else {
      // Parse inline formatting for regular text
      const children = parseInlineText(line);
      nodes.push({
        type: 'p',
        children
      });
    }
  }
  
  return nodes.length > 0 ? nodes : [{ type: 'p', children: [{ text: '' }] }];
};

// Parse inline text formatting
const parseInlineText = (text: string) => {
  // For now, we'll keep it simple and just return plain text
  // In a full implementation, you'd parse **bold**, *italic*, etc.
  return [{ text }];
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
  editable?: boolean;
}

export function DocumentViewer({ 
  content, 
  title, 
  time, 
  timing,
  isTransforming, 
  className,
  editable = false
}: DocumentViewerProps) {
  const [hydrated, setHydrated] = React.useState(false);
  
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const initialValue = useMemo(() => parseMarkdownToPlate(content), [content]);

  const editor = usePlateEditor({
    plugins: [
      HeadingPlugin,
      BlockquotePlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
    ],
    value: initialValue,
  });

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

    // Default view: editable -> Plate, read-only -> markdown preview
    if (editable) {
      return (
        <div className={cn('prose prose-lg max-w-none px-6', 'text-foreground')}>
          <Plate editor={editor} onChange={({value})=>{/* */}}>
            <PlateContent readOnly={!editable} />
          </Plate>
        </div>
      );
    }

    return (
      <div className={cn('prose prose-lg max-w-none px-6', 'text-foreground')}>
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

        {/* Second Row - Timing Information - Always present but conditionally visible */}
        <div className={cn(
          "flex items-center justify-between bg-muted/50 -mx-6 px-6 py-2 border-t border-border/50",
          (!isTransforming && !(timing || time !== null)) && "invisible"
        )}>
          <div className="text-xs font-medium text-muted-foreground">
            ⚡ Performance Metrics:
          </div>
          <div className="flex items-center space-x-2">
            {renderTimingInfo()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="max-w-[840px] w-full mx-auto px-6 py-6 h-full">
          <div className="bg-background rounded-lg p-6 shadow-sm border border-border h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 