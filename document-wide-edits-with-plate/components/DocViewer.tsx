'use client';

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Badge } from '@/components/ui';
import { Loader2 } from 'lucide-react';
import { Plate, PlateContent, usePlateEditor, createPlateEditor } from 'platejs/react';
import {
  HeadingPlugin,
  BlockquotePlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
  ParagraphPlugin,
} from '@platejs/basic-nodes';
import {
  ListPlugin,
  BulletedListPlugin,
  NumberedListPlugin,
  ListItemPlugin,
} from '@platejs/list';
import { LinkPlugin } from '@platejs/link';
import { AutoformatPlugin } from '@platejs/autoformat';
import { IndentPlugin } from '@platejs/indent';

// Utility functions for document stats
const getWordCount = (nodes: any[]): number => {
  const getText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (node.text) return node.text;
    if (node.children) return node.children.map(getText).join('');
    return '';
  };
  const text = nodes.map(getText).join(' ');
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

const getCharacterCount = (nodes: any[]): number => {
  const getText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (node.text) return node.text;
    if (node.children) return node.children.map(getText).join('');
    return '';
  };
  return nodes.map(getText).join('').length;
};

const getReadingTime = (nodes: any[]): number => {
  const wordsPerMinute = 200;
  const wordCount = getWordCount(nodes);
  return Math.ceil(wordCount / wordsPerMinute);
};

// Convert markdown to Plate value
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
        children: [{ type: 'p', children: parseInlineText(trimmedLine.slice(2)) }]
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
        children: [{ type: 'lic', children: parseInlineText(trimmedLine.slice(2)) }]
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
        children: [{ type: 'lic', children: parseInlineText(trimmedLine.replace(/^\d+\.\s/, '')) }]
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
      // Add empty paragraph for spacing
      if (nodes.length > 0 && nodes[nodes.length - 1].type !== 'p') {
        nodes.push({ type: 'p', children: [{ text: '' }] });
      }
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
        type: listType === 'ul' ? 'ul' : 'ol',
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

// Parse inline text with formatting
const parseInlineText = (text: string) => {
  if (!text) return [{ text: '' }];
  
  const children: any[] = [];
  let currentText = '';
  let i = 0;
  
  while (i < text.length) {
    // Handle bold text (**text**)
    if (text.slice(i, i + 2) === '**' && text.indexOf('**', i + 2) !== -1) {
      if (currentText) {
        children.push({ text: currentText });
        currentText = '';
      }
      
      const endIndex = text.indexOf('**', i + 2);
      const boldText = text.slice(i + 2, endIndex);
      children.push({ text: boldText, bold: true });
      i = endIndex + 2;
      continue;
    }
    
    // Handle italic text (*text*)
    if (text[i] === '*' && text.indexOf('*', i + 1) !== -1) {
      if (currentText) {
        children.push({ text: currentText });
        currentText = '';
      }
      
      const endIndex = text.indexOf('*', i + 1);
      const italicText = text.slice(i + 1, endIndex);
      children.push({ text: italicText, italic: true });
      i = endIndex + 1;
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
        children.push({ text: codeText, code: true });
        i = endIndex + 1;
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

// Convert Plate value to markdown for API
const plateToMarkdown = (value: any[]): string => {
  const nodeToMarkdown = (node: any): string => {
    if (node.text !== undefined) {
      let text = node.text;
      if (node.bold) text = `**${text}**`;
      if (node.italic) text = `*${text}*`;
      if (node.code) text = `\`${text}\``;
      return text;
    }
    
    const children = node.children?.map(nodeToMarkdown).join('') || '';
    
    switch (node.type) {
      case 'h1': return `# ${children}\n\n`;
      case 'h2': return `## ${children}\n\n`;
      case 'h3': return `### ${children}\n\n`;
      case 'h4': return `#### ${children}\n\n`;
      case 'h5': return `##### ${children}\n\n`;
      case 'h6': return `###### ${children}\n\n`;
      case 'p': return `${children}\n\n`;
      case 'blockquote': return `> ${children}\n\n`;
      case 'ul':
        return node.children?.map((li: any) => {
          const content = li.children?.[0]?.children?.map(nodeToMarkdown).join('') || '';
          return `- ${content}`;
        }).join('\n') + '\n\n';
      case 'ol':
        return node.children?.map((li: any, index: number) => {
          const content = li.children?.[0]?.children?.map(nodeToMarkdown).join('') || '';
          return `${index + 1}. ${content}`;
        }).join('\n') + '\n\n';
      case 'code_block': return `\`\`\`\n${children}\n\`\`\`\n\n`;
      default: return children;
    }
  };
  
  return value.map(nodeToMarkdown).join('').trim();
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
  onContentChange?: (content: string) => void;
}

export function DocumentViewer({ 
  content, 
  title, 
  time, 
  timing,
  isTransforming, 
  className,
  editable = true,
  onContentChange
}: DocumentViewerProps) {
  const [hydrated, setHydrated] = useState(false);
  const [plateValue, setPlateValue] = useState(() => parseMarkdownToPlate(content));
  
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Update plate value when content changes (for streaming updates)
  useEffect(() => {
    const newValue = parseMarkdownToPlate(content);
    setPlateValue(newValue);
  }, [content]);

  const editor = usePlateEditor({
    plugins: [
      ParagraphPlugin,
      HeadingPlugin,
      BlockquotePlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
      LinkPlugin,
      ListPlugin,
      BulletedListPlugin,
      NumberedListPlugin,
      ListItemPlugin,
      IndentPlugin.configure({
        inject: {
          targetPlugins: [
            ParagraphPlugin.key,
            BlockquotePlugin.key,
            CodePlugin.key,
          ],
        },
      }),
      AutoformatPlugin.configure({
        options: {
          rules: [
            // Headings
            {
              mode: 'block',
              type: 'h1',
              match: '# ',
              format: (editor) => {
                editor.setBlocks({ type: 'h1' });
              },
            },
            {
              mode: 'block',
              type: 'h2',
              match: '## ',
              format: (editor) => {
                editor.setBlocks({ type: 'h2' });
              },
            },
            {
              mode: 'block',
              type: 'h3',
              match: '### ',
              format: (editor) => {
                editor.setBlocks({ type: 'h3' });
              },
            },
            // Lists
            {
              mode: 'block',
              type: 'ul',
              match: ['* ', '- ', '+ '],
              format: (editor) => {
                editor.setBlocks({ type: 'ul' });
              },
            },
            {
              mode: 'block',
              type: 'ol',
              match: /^(\d+)\. $/,
              format: (editor) => {
                editor.setBlocks({ type: 'ol' });
              },
            },
            // Blockquote
            {
              mode: 'block',
              type: 'blockquote',
              match: '> ',
              format: (editor) => {
                editor.setBlocks({ type: 'blockquote' });
              },
            },
          ],
        },
      }),
    ],
    value: plateValue,
  });

  const handleChange = useCallback((newValue: any[]) => {
    setPlateValue(newValue);
    if (onContentChange && editable) {
      const markdown = plateToMarkdown(newValue);
      onContentChange(markdown);
    }
  }, [onContentChange, editable]);

  const stats = {
    words: plateValue ? getWordCount(plateValue) : 0,
    characters: plateValue ? getCharacterCount(plateValue) : 0,
    readingTime: plateValue ? getReadingTime(plateValue) : 0,
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
    if (!plateValue || plateValue.length === 0 || (plateValue.length === 1 && plateValue[0].children?.[0]?.text === '')) {
      return (
        <div className="flex items-center justify-center h-full min-h-[600px]">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-medium mb-2">Ready for Transformation</h3>
            <p className="text-sm">Start typing or use the AI assistant to create content</p>
          </div>
        </div>
      );
    }

    return (
      <Plate 
        editor={editor} 
        value={plateValue} 
        onChange={handleChange}
        readOnly={!editable}
      >
        <PlateContent 
          className={cn(
            'min-h-[600px] w-full p-0 focus:outline-none',
            // Notion-like styling
            '[&_.slate-editor]:min-h-[600px]',
            '[&_.slate-editor]:p-0',
            '[&_.slate-editor]:text-base',
            '[&_.slate-editor]:leading-7',
            '[&_.slate-editor]:text-gray-900',
            // Headings
            '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-gray-900',
            '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-gray-900',
            '[&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-gray-900',
            '[&_h4]:text-lg [&_h4]:font-bold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-gray-900',
            '[&_h5]:text-base [&_h5]:font-bold [&_h5]:mt-3 [&_h5]:mb-2 [&_h5]:text-gray-900',
            '[&_h6]:text-sm [&_h6]:font-bold [&_h6]:mt-3 [&_h6]:mb-2 [&_h6]:text-gray-900',
            // Paragraphs
            '[&_p]:mb-3 [&_p]:leading-7',
            // Lists
            '[&_ul]:mb-3 [&_ul]:pl-6',
            '[&_ol]:mb-3 [&_ol]:pl-6',
            '[&_li]:mb-1 [&_li]:leading-7',
            // Blockquotes
            '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:mb-3 [&_blockquote]:text-gray-700 [&_blockquote]:italic',
            // Code
            '[&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono',
            '[&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:mb-3 [&_pre]:overflow-x-auto',
            // Links
            '[&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800',
            // Formatting
            '[&_strong]:font-bold',
            '[&_em]:italic',
            '[&_u]:underline',
            '[&_s]:line-through'
          )}
          placeholder="Start writing..."
        />
      </Plate>
    );
  };

  return (
    <div className={cn('flex flex-col h-full bg-gray-50', className)}>
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white">
        {/* Title and Actions Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-sm font-medium text-gray-900">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {hydrated && (
              <div className="text-xs text-gray-500 flex items-center space-x-2" suppressHydrationWarning>
                <span>{stats.words} words</span>
                <span>•</span>
                <span>{stats.readingTime} min read</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics - Only visible when transforming or has timing info */}
        {(isTransforming || timing || time !== null) && (
          <div className="flex items-center justify-between bg-gray-100 -mx-6 px-6 py-2 border-t border-gray-200 mt-2">
            <div className="flex items-center space-x-2">
              {isTransforming && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Transforming...</span>
                </div>
              )}
              {!isTransforming && (
                <div className="text-xs font-medium text-gray-600">
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
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-[840px] w-full mx-auto px-6 py-6 h-full">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 