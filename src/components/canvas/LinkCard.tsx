'use client';

import React from 'react';
import type { LinkCard as LinkCardType } from '@/types/canvas';
import { BaseCardWrapper } from './BaseCardWrapper';
import { ExternalLink, Globe } from 'lucide-react';
import Image from 'next/image';

interface LinkCardProps {
  card: LinkCardType;
}

export function LinkCard({ card }: LinkCardProps) {
  const domain = (() => {
    try {
      return new URL(card.url).hostname.replace('www.', '');
    } catch {
      return card.url;
    }
  })();

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      window.open(card.url, '_blank');
    }
  };

  return (
    <BaseCardWrapper card={card}>
      {/* Preview Image */}
      {card.previewImage && (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-xl">
          <Image
            src={card.previewImage}
            alt={card.title}
            fill
            className="object-cover"
            sizes="320px"
          />
        </div>
      )}

      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
          {card.title}
        </h3>

        {/* Description */}
        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
            {card.description}
          </p>
        )}

        {/* Link Preview Footer */}
        <div
          className="flex items-center gap-2 pt-2 border-t border-border cursor-pointer hover:text-primary transition-colors"
          onClick={handleClick}
        >
          {card.favicon ? (
            <Image
              src={card.favicon}
              alt=""
              width={16}
              height={16}
              className="rounded-sm"
            />
          ) : (
            <Globe className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground flex-1 truncate">
            {domain}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </BaseCardWrapper>
  );
}
