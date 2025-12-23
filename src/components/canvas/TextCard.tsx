'use client';

import React from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import type { TextCard as TextCardType } from '@/types/canvas';
import { BaseCardWrapper } from './BaseCardWrapper';

interface TextCardProps {
  card: TextCardType;
}

export function TextCard({ card }: TextCardProps) {
  const { updateCard } = useCanvasStore();

  const handleTitleChange = (title: string) => {
    updateCard(card.id, { title });
  };

  const handleContentChange = (content: string) => {
    updateCard(card.id, { content });
  };

  return (
    <BaseCardWrapper card={card}>
      <div
        className="p-4"
        style={card.accentColor ? {
          borderLeft: `3px solid ${card.accentColor}`,
          backgroundColor: `${card.accentColor}08`,
        } : undefined}
      >
        {/* Card Title */}
        <h3
          className="font-semibold text-sm text-foreground mb-2 outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleTitleChange(e.currentTarget.textContent || '')}
        >
          {card.title || 'Untitled'}
        </h3>

        {/* Card Content */}
        <p
          className="text-sm text-muted-foreground leading-relaxed outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
        >
          {card.content || 'Add your notes here...'}
        </p>
      </div>
    </BaseCardWrapper>
  );
}
