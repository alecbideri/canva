'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import type { Card } from '@/types/canvas';
import { MoreHorizontal, Trash2, Copy, Link } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BaseCardWrapperProps {
  card: Card;
  children: React.ReactNode;
  className?: string;
}

export function BaseCardWrapper({ card, children, className = '' }: BaseCardWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const {
    selection,
    selectCard,
    deleteCard,
    duplicateCard,
    moveCard,
    startDrag,
    updateDrag,
    endDrag,
  } = useCanvasStore();

  const isSelected = selection.selectedCardIds.includes(card.id);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start drag from card header area or if shift not pressed
      e.stopPropagation();

      if (e.button !== 0) return; // Only left click

      setIsDragging(true);
      setDragOffset({
        x: e.clientX - card.position.x,
        y: e.clientY - card.position.y,
      });
      startDrag('card', card.id, card.position);
      selectCard(card.id, e.shiftKey);
    },
    [card, startDrag, selectCard]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        moveCard(card.id, { x: newX, y: newY });
        updateDrag({ x: newX, y: newY });
      }
    },
    [isDragging, dragOffset, card.id, moveCard, updateDrag]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      endDrag();
    }
  }, [isDragging, endDrag]);

  return (
    <div
      ref={cardRef}
      className={`
        absolute group
        bg-card rounded-xl card-shadow
        min-w-[200px] max-w-[320px]
        transition-all duration-150
        ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}
        ${isDragging ? 'opacity-90 shadow-2xl scale-[1.02] z-50' : 'hover:card-shadow-hover'}
        ${className}
      `}
      style={{
        left: card.position.x,
        top: card.position.y,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Connector Nodes */}
      <ConnectorNode position="top" cardId={card.id} />
      <ConnectorNode position="right" cardId={card.id} />
      <ConnectorNode position="bottom" cardId={card.id} />
      <ConnectorNode position="left" cardId={card.id} />

      {/* Card Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-md bg-card/80 hover:bg-muted backdrop-blur-sm shadow-sm">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => duplicateCard(card.id)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link className="w-4 h-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteCard(card.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card Content */}
      {children}
    </div>
  );
}

// Connector Node Component
interface ConnectorNodeProps {
  position: 'top' | 'right' | 'bottom' | 'left';
  cardId: string;
}

function ConnectorNode({ position, cardId }: ConnectorNodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    right: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
    bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    left: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={`
        absolute connector-node z-20
        opacity-0 group-hover:opacity-100
        ${positionClasses[position]}
        ${isHovered ? 'scale-130 bg-accent-green border-connection-hover' : ''}
      `}
      data-card-id={cardId}
      data-position={position}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}
