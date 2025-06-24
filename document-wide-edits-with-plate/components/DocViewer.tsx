'use client';

import React, { useMemo } from 'react';
import { cn } from '../lib/utils';
import { Badge } from '@/components/ui';
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

// Enhanced markdown to Plate value converter
const parseMarkdownToPlate = (markdown: string) => {
  if (!markdown || markdown.trim() === '') {
    return [{ type: 'p', children: [{ text: '' }] }];
  }

  const lines = markdown.split('\n');
  const nodes: any[] = [];
  let inList = false;
  let listType = '';
  let listItems: any[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Handle headings
    if (trimmedLine.startsWith('# ')) {
      flushList();
      nodes.push({
        type: 'h1',
        children: parseInlineText(trimmedLine.slice(2))
      });
    } else if (trimmedLine.startsWith('## ')) {
      flushList();
      nodes.push({
        type: 'h2',
        children: parseInlineText(trimmedLine.slice(3))
      });
    } else if (trimmedLine.startsWith('### ')) {
      flushList();
      nodes.push({
        type: 'h3',
        children: parseInlineText(trimmedLine.slice(4))
      });
    } else if (trimmedLine.startsWith('#### ')) {
      flushList();
      nodes.push({
        type: 'h4',
        children: parseInlineText(trimmedLine.slice(5))
      });
    } else if (trimmedLine.startsWith('##### ')) {
      flushList();
      nodes.push({
        type: 'h5',
        children: parseInlineText(trimmedLine.slice(6))
      });
    } else if (trimmedLine.startsWith('###### ')) {
      flushList();
      nodes.push({
        type: 'h6',
        children: parseInlineText(trimmedLine.slice(7))
      });
    }
    // Handle blockquotes
    else if (trimmedLine.startsWith('> ')) {
      flushList();
      nodes.push({
        type: 'blockquote',
        children: parseInlineText(trimmedLine.slice(2))
      });
    }
    // Handle horizontal rules
    else if (trimmedLine.match(/^[-*_]{3,}$/)) {
      flushList();
      nodes.push({
        type: 'hr',
        children: [{ text: '' }]
      });
    }
    // Handle unordered lists
    else if (trimmedLine.match(/^[-*+]\s/)) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
        listItems = [];
      }
      listItems.push({
        type: 'li',
        children: parseInlineText(trimmedLine.slice(2))
      });
    }
    // Handle ordered lists
    else if (trimmedLine.match(/^\d+\.\s/)) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
        listItems = [];
      }
      listItems.push({
        type: 'li',
        children: parseInlineText(trimmedLine.replace(/^\d+\.\s/, ''))
      });
    }
    // Handle code blocks
    else if (trimmedLine.startsWith('```')) {
      flushList();
      const codeBlock = extractCodeBlock(lines, i);
      if (codeBlock) {
        nodes.push({
          type: 'code_block',
          children: [{ text: codeBlock.content }]
        });
        i = codeBlock.endIndex;
      }
    }
    // Handle empty lines
    else if (trimmedLine === '') {
      flushList();
      // Don't add empty paragraphs, just continue
      continue;
    }
    // Handle regular paragraphs
    else {
      flushList();
      nodes.push({
        type: 'p',
        children: parseInlineText(trimmedLine)
      });
    }
  }
  
  // Flush any remaining list
  flushList();
  
  return nodes.length > 0 ? nodes : [{ type: 'p', children: [{ text: '' }] }];
  
  function flushList() {
    if (inList && listItems.length > 0) {
      nodes.push({
        type: listType,
        children: listItems
      });
      inList = false;
      listType = '';
      listItems = [];
    }
  }
};

// Extract code block content
const extractCodeBlock = (lines: string[], startIndex: number) => {
  const startLine = lines[startIndex];
  const language = startLine.slice(3).trim();
  
  let content = '';
  let endIndex = startIndex;
  
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].startsWith('```')) {
      endIndex = i;
      break;
    }
    content += lines[i] + '\n';
  }
  
  return {
    content: content.trim(),
    language,
    endIndex
  };
};

// Enhanced inline text parsing
const parseInlineText = (text: string) => {
  if (!text) return [{ text: '' }];
  
  const children: any[] = [];
  let currentText = '';
  let i = 0;
  
  while (i < text.length) {
    // Handle bold text (**text** or __text__)
    if ((text.slice(i, i + 2) === '**' || text.slice(i, i + 2) === '__') && 
        text.indexOf(text.slice(i, i + 2), i + 2) !== -1) {
      if (currentText) {
        children.push({ text: currentText });
        currentText = '';
      }
      
      const endIndex = text.indexOf(text.slice(i, i + 2), i + 2);
      const boldText = text.slice(i + 2, endIndex);
      children.push({
        type: 'bold',
        children: [{ text: boldText }]
      });
      i = endIndex + 2;
      continue;
    }
    
    // Handle italic text (*text* or _text_)
    if ((text[i] === '*' || text[i] === '_') && 
        text.indexOf(text[i], i + 1) !== -1) {
      if (currentText) {
        children.push({ text: currentText });
        currentText = '';
      }
      
      const endIndex = text.indexOf(text[i], i + 1);
      const italicText = text.slice(i + 1, endIndex);
      children.push({
        type: 'italic',
        children: [{ text: italicText }]
      });
      i = endIndex + 1;
      continue;
    }
    
    // Handle strikethrough text (~~text~~)
    if (text.slice(i, i + 2) === '~~' && text.indexOf('~~', i + 2) !== -1) {
      if (currentText) {
        children.push({ text: currentText });
        currentText = '';
      }
      
      const endIndex = text.indexOf('~~', i + 2);
      const strikeText = text.slice(i + 2, endIndex);
      children.push({
        type: 'strikethrough',
        children: [{ text: strikeText }]
      });
      i = endIndex + 2;
      continue;
    }
    
    // Handle inline code (`code`)
    if (text[i] === '`') {
      if (currentText) {
        children.push({ text: currentText });
        currentText = '';
      }
      
      const endIndex = text.indexOf('`', i + 1);
      if (endIndex !== -1) {
        const codeText = text.slice(i + 1, endIndex);
        children.push({
          type: 'code',
          children: [{ text: codeText }]
        });
        i = endIndex + 1;
        continue;
      }
    }
    
    // Handle links [text](url)
    if (text[i] === '[') {
      const endBracket = text.indexOf(']', i);
      const startParen = text.indexOf('(', endBracket);
      const endParen = text.indexOf(')', startParen);
      
      if (endBracket !== -1 && startParen !== -1 && endParen !== -1) {
        if (currentText) {
          children.push({ text: currentText });
          currentText = '';
        }
        
        const linkText = text.slice(i + 1, endBracket);
        const linkUrl = text.slice(startParen + 1, endParen);
        
        children.push({
          type: 'a',
          url: linkUrl,
          children: [{ text: linkText }]
        });
        i = endParen + 1;
        continue;
      }
    }
    
    currentText += text[i];
    i++;
  }
  
  if (currentText) {
    children.push({ text: currentText });
  }
  
  return children.length > 0 ? children : [{ text: '' }];
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
            <Badge variant="warning" className="text-xs">
              Edit: {timing.editGenerationTime}ms
            </Badge>
          )}
          {timing.applicationTime !== undefined && timing.applicationTime > 0 && (
            <Badge variant="success" className="text-xs">
              Apply: {timing.applicationTime}ms
            </Badge>
          )}
          <Badge variant="brand" className="text-xs font-medium">
            Total: {timing.totalTime}ms
          </Badge>
        </div>
      );
    }
    
    if (time !== null && time > 0) {
      return (
        <Badge variant="brand" className="text-xs font-medium">
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
          <div className="text-center text-subtext-color">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-medium mb-2">Ready for Transformation</h3>
            <p className="text-sm">Select a transformation from the options below to see the results</p>
          </div>
        </div>
      );
    }

    // Use ReactMarkdown for comprehensive markdown support with Notion-like styling
    return (
      <div className={cn(
        'prose prose-lg max-w-none text-default-font',
        'prose-headings:text-default-font prose-p:text-default-font prose-li:text-default-font prose-blockquote:text-subtext-color prose-code:text-default-font prose-pre:bg-neutral-50 prose-pre:text-default-font prose-strong:text-default-font prose-em:text-default-font prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline'
      )}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full bg-neutral-50', className)}>
      {/* Header */}
      <div className="px-6 py-3 border-b border-neutral-border bg-default-background">
        {/* Title and Actions Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-sm font-medium text-default-font">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {hydrated && (
              <div className="text-xs text-subtext-color flex items-center space-x-2" suppressHydrationWarning>
                <span>{stats.words} words</span>
                <span>•</span>
                <span>{stats.readingTime} min read</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics - Only visible when transforming or has timing info */}
        {(isTransforming || timing || time !== null) && (
          <div className="flex items-center justify-between bg-neutral-100 -mx-6 px-6 py-2 border-t border-neutral-border mt-2">
            <div className="flex items-center space-x-2">
              {isTransforming && (
                <div className="flex items-center space-x-2 text-sm text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Transforming...</span>
                </div>
              )}
              {!isTransforming && (
                <div className="text-xs font-medium text-subtext-color">
                  ⚡ Performance Metrics:
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {renderTimingInfo()}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-neutral-50">
        <div className="max-w-[840px] w-full mx-auto px-6 py-6 h-full">
          <div className="bg-default-background rounded-lg p-6 shadow-sm border border-neutral-border h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 