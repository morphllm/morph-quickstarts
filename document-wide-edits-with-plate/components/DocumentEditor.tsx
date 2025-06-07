'use client';

import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDocumentHistory } from '@/hooks/useDocumentHistory';
import { DEMO_CONTENT } from '@/lib/constants';
import { getWordCount, getCharacterCount, getReadingTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DocumentEditorProps {
  onContentChange?: (content: string) => void;
  className?: string;
}

export const DocumentEditor = forwardRef<any, DocumentEditorProps>(({ onContentChange, className }, ref) => {
  const [content, setContent] = useState(DEMO_CONTENT);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    words: getWordCount(DEMO_CONTENT),
    characters: getCharacterCount(DEMO_CONTENT),
    readingTime: getReadingTime(DEMO_CONTENT),
  });

  const { saveSnapshot, undo, redo, canUndo, canRedo } = useDocumentHistory();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle editor changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
    
    // Update stats immediately for better UX
    setStats({
      words: getWordCount(newContent),
      characters: getCharacterCount(newContent),
      readingTime: getReadingTime(newContent),
    });
  }, [onContentChange]);

  // Save snapshot when content changes significantly
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (content && content !== DEMO_CONTENT) {
        saveSnapshot(content, 'Auto-save');
      }
    }, 5000);

    return () => clearTimeout(saveTimer);
  }, [content, saveSnapshot]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              const snapshot = redo();
              if (snapshot && textareaRef.current) {
                textareaRef.current.value = snapshot.content;
                setContent(snapshot.content);
                onContentChange?.(snapshot.content);
              }
            } else {
              e.preventDefault();
              const snapshot = undo();
              if (snapshot && textareaRef.current) {
                textareaRef.current.value = snapshot.content;
                setContent(snapshot.content);
                onContentChange?.(snapshot.content);
              }
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, onContentChange]);

  const updateContent = useCallback((newContent: string, switchToPreview = false, skipCallback = false) => {
    if (textareaRef.current) {
      textareaRef.current.value = newContent;
    }
    setContent(newContent);
    
    // Only call onContentChange if not explicitly skipped (to prevent loops)
    if (!skipCallback) {
      onContentChange?.(newContent);
    }
    
    // Switch to preview mode if requested (e.g., after AI transformations)
    if (switchToPreview) {
      setIsEditing(false);
    }
    
    // Update stats
    setStats({
      words: getWordCount(newContent),
      characters: getCharacterCount(newContent),
      readingTime: getReadingTime(newContent),
    });
  }, [onContentChange]);

  const resetToOriginal = useCallback(() => {
    updateContent(DEMO_CONTENT, true);
    saveSnapshot(DEMO_CONTENT, 'Reset to original');
  }, [updateContent, saveSnapshot]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateContentAndPreview: (newContent: string) => {
      updateContent(newContent, true, true); // Skip callback to prevent loop
    },
    switchToPreview: () => {
      setIsEditing(false);
    },
    switchToEdit: () => {
      setIsEditing(true);
    }
  }), [updateContent]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-notion-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-notion-lg font-semibold text-notion-gray-900">
            Document Editor
          </h1>
          <div className="flex items-center space-x-2 text-notion-sm text-notion-gray-500">
            <span>{stats.words} words</span>
            <span>•</span>
            <span>{stats.characters} characters</span>
            <span>•</span>
            <span>{stats.readingTime} min read</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "px-3 py-1.5 text-notion-sm rounded-md transition-colors",
              isEditing 
                ? "bg-notion-blue-100 text-notion-blue-700 hover:bg-notion-blue-200" 
                : "bg-notion-gray-100 text-notion-gray-700 hover:bg-notion-gray-200"
            )}
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>

          <button
            onClick={() => {
              const snapshot = undo();
              if (snapshot) updateContent(snapshot.content);
            }}
            disabled={!canUndo}
            className="p-2 rounded-md hover:bg-notion-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Cmd+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              const snapshot = redo();
              if (snapshot) updateContent(snapshot.content);
            }}
            disabled={!canRedo}
            className="p-2 rounded-md hover:bg-notion-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Cmd+Shift+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>

          <button
            onClick={resetToOriginal}
            className="px-3 py-1.5 text-notion-sm bg-notion-gray-100 hover:bg-notion-gray-200 rounded-md transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 h-full">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              className={cn(
                'w-full h-full min-h-[600px] resize-none',
                'text-notion-base leading-relaxed',
                'text-notion-gray-900 font-notion',
                'border-none outline-none',
                'placeholder:text-notion-gray-400',
                'bg-transparent'
              )}
              placeholder="Start writing your document..."
            />
          ) : (
            <div 
              className={cn(
                'w-full min-h-[600px] cursor-text',
                'prose prose-lg prose-notion max-w-none',
                'text-notion-gray-900 font-notion'
              )}
              onClick={() => setIsEditing(true)}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => (
                    <h1 className="text-3xl font-bold text-notion-gray-900 mb-4 mt-8 leading-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({children}) => (
                    <h2 className="text-2xl font-semibold text-notion-gray-900 mb-3 mt-6 leading-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({children}) => (
                    <h3 className="text-xl font-medium text-notion-gray-900 mb-2 mt-4 leading-tight">
                      {children}
                    </h3>
                  ),
                  p: ({children}) => (
                    <p className="text-notion-base text-notion-gray-900 leading-relaxed mb-3">
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
                    <li className="text-notion-base text-notion-gray-900 leading-relaxed mb-1">
                      {children}
                    </li>
                  ),
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-notion-gray-300 pl-4 italic text-notion-gray-600 my-4">
                      {children}
                    </blockquote>
                  ),
                  strong: ({children}) => (
                    <strong className="font-semibold text-notion-gray-900">
                      {children}
                    </strong>
                  ),
                  em: ({children}) => (
                    <em className="italic">
                      {children}
                    </em>
                  ),
                  code: ({children}) => (
                    <code className="bg-notion-gray-100 text-notion-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                }}
              >
                {content || "Click to start writing..."}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DocumentEditor.displayName = 'DocumentEditor';

export default DocumentEditor; 