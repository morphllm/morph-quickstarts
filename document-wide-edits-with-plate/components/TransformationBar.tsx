'use client';

import React from 'react';
import { DOCUMENT_TRANSFORMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TransformationBarProps {
  onTransform: (transformationKey: string) => void;
  onReset: () => void;
  isTransforming: boolean;
  className?: string;
}

export function TransformationBar({ onTransform, onReset, isTransforming, className }: TransformationBarProps) {
  return (
    <div className={cn(
      'border-t border-border bg-background p-4',
      'flex items-center justify-center space-x-3',
      'shadow-lg', // Add shadow for fixed positioning
      className
    )}>
      {/* Reset Button - Primary */}
      <Button
        onClick={onReset}
        disabled={isTransforming}
        variant="default"
        size="default"
        className="px-6"
      >
        Reset
      </Button>

      {/* Divider */}
      <div className="w-px h-8 bg-border mx-2" />

      {/* Transformation Buttons - Secondary */}
      {DOCUMENT_TRANSFORMS.map((transform) => (
        <Button
          key={transform.key}
          onClick={() => onTransform(transform.key)}
          disabled={isTransforming}
          variant="outline"
          size="default"
        >
          {transform.title}
        </Button>
      ))}
    </div>
  );
} 