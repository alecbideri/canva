'use client';

import React from 'react';
import type { CanvasBoard } from '@/types/canvas';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FolderCardProps {
  board: CanvasBoard;
}

export function FolderCard({ board }: FolderCardProps) {
  const router = useRouter();

  // Get preview cards (up to 3)
  const previewCards = board.cards.slice(0, 3);
  const cardCount = board.cards.length;
  const sectionCount = board.sections.length;

  // Find a media card for the hero image
  const heroCard = board.cards.find((c) => c.type === 'media');
  const heroImage = heroCard?.type === 'media' ? heroCard.imageUrl : null;

  const handleClick = () => {
    router.push(`/canvas/${board.id}`);
  };

  return (
    <div
      className="group relative cursor-pointer"
      onClick={handleClick}
    >
      {/* Stacked Cards Effect - Back layers */}
      <div className="absolute -bottom-2 left-3 right-3 h-full bg-card/60 rounded-2xl border border-border/30" />
      <div className="absolute -bottom-1 left-1.5 right-1.5 h-full bg-card/80 rounded-2xl border border-border/50" />

      {/* Main Card */}
      <div className="relative bg-card rounded-2xl card-shadow overflow-hidden transition-all duration-300 group-hover:card-shadow-hover group-hover:-translate-y-1">
        {/* Hero Image Area */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={board.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <div className="text-4xl font-bold text-muted-foreground/30">
                {board.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Floating mini-cards */}
          {previewCards.slice(0, 2).map((card, idx) => (
            <div
              key={card.id}
              className={`
                absolute bg-card/95 backdrop-blur-sm rounded-lg p-2 shadow-lg
                max-w-[140px] text-xs
                ${idx === 0 ? 'bottom-4 left-4' : 'bottom-8 right-4'}
              `}
              style={{
                transform: `rotate(${idx === 0 ? -3 : 2}deg)`,
              }}
            >
              {card.type === 'text' && (
                <p className="text-foreground line-clamp-2 font-medium">
                  {card.title}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Card Footer */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
            {board.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {cardCount} {cardCount === 1 ? 'card' : 'cards'} • {sectionCount} {sectionCount === 1 ? 'section' : 'sections'}
          </p>
        </div>
      </div>
    </div>
  );
}
