'use client';

import React from 'react';
import type { MediaCard as MediaCardType } from '@/types/canvas';
import { BaseCardWrapper } from './BaseCardWrapper';
import Image from 'next/image';

interface MediaCardProps {
  card: MediaCardType;
}

export function MediaCard({ card }: MediaCardProps) {
  return (
    <BaseCardWrapper card={card}>
      {/* Media Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl">
        <Image
          src={card.imageUrl}
          alt={card.title || 'Media'}
          fill
          className="object-cover"
          sizes="320px"
        />
      </div>

      {/* Caption / Title */}
      {(card.title || card.caption) && (
        <div className="p-3">
          {card.title && (
            <h3 className="font-semibold text-sm text-foreground">
              {card.title}
            </h3>
          )}
          {card.caption && (
            <p className="text-xs text-muted-foreground mt-1">
              {card.caption}
            </p>
          )}
        </div>
      )}
    </BaseCardWrapper>
  );
}
