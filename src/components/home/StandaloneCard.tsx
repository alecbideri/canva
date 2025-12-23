'use client';

import React from 'react';
import type { Card } from '@/types/canvas';
import Image from 'next/image';
import { Hash, MessageSquare, FileText } from 'lucide-react';

interface StandaloneCardProps {
  card: Card;
  onClick?: () => void;
}

// Define accent colors for variety
const accentColors = [
  { bg: 'bg-accent-green/20', border: 'border-accent-green/30', icon: 'text-accent-green' },
  { bg: 'bg-accent-orange/20', border: 'border-accent-orange/30', icon: 'text-accent-orange' },
  { bg: 'bg-accent-mint', border: 'border-accent-mint', icon: 'text-primary' },
  { bg: 'bg-accent-yellow/20', border: 'border-accent-yellow/30', icon: 'text-accent-yellow' },
];

export function StandaloneCard({ card, onClick }: StandaloneCardProps) {
  // Get accent color based on card id
  const colorIndex = card.id.charCodeAt(0) % accentColors.length;
  const accent = accentColors[colorIndex];

  const renderIcon = () => {
    switch (card.type) {
      case 'text':
        return <FileText className={`w-5 h-5 ${accent.icon}`} />;
      case 'link':
        return <Hash className={`w-5 h-5 ${accent.icon}`} />;
      case 'media':
        return <MessageSquare className={`w-5 h-5 ${accent.icon}`} />;
    }
  };

  const renderContent = () => {
    switch (card.type) {
      case 'text':
        return (
          <>
            <h4 className="font-semibold text-foreground mb-2">{card.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-4">{card.content}</p>
          </>
        );
      case 'media':
        return (
          <>
            <div className="relative aspect-square w-full mb-3 rounded-lg overflow-hidden">
              <Image
                src={card.imageUrl}
                alt={card.title || 'Media'}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
            {card.title && (
              <h4 className="font-semibold text-foreground">{card.title}</h4>
            )}
          </>
        );
      case 'link':
        return (
          <>
            <h4 className="font-semibold text-foreground mb-1">{card.title}</h4>
            {card.description && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                {card.description}
              </p>
            )}
            <p className="text-xs text-primary truncate">{card.url}</p>
          </>
        );
    }
  };

  return (
    <div
      className={`
        group relative bg-card rounded-2xl card-shadow p-4
        cursor-pointer transition-all duration-300
        hover:card-shadow-hover hover:-translate-y-0.5
        ${accent.border} border
      `}
      onClick={onClick}
    >
      {/* Accent Color Block */}
      <div className={`w-full h-16 rounded-lg ${accent.bg} mb-4 flex items-center justify-center`}>
        {renderIcon()}
      </div>

      {/* Content */}
      <div className="space-y-1">
        {renderContent()}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
