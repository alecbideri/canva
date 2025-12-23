'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import { Section } from './Section';
import { TextCard } from './TextCard';
import { MediaCard } from './MediaCard';
import { LinkCard } from './LinkCard';
import { ConnectionLayer } from './ConnectionLayer';
import type { Card as CardType } from '@/types/canvas';

interface CanvasProps {
  className?: string;
}

export function Canvas({ className = '' }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const {
    activeBoard,
    viewport,
    activeTool,
    setViewport,
    clearSelection,
  } = useCanvasStore();

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.25, Math.min(3, viewport.zoom + delta));
        setViewport({ zoom: newZoom });
      } else {
        // Pan with scroll
        setViewport({
          panX: viewport.panX - e.deltaX,
          panY: viewport.panY - e.deltaY,
        });
      }
    },
    [viewport, setViewport]
  );

  // Handle panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || activeTool === 'pan') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - viewport.panX, y: e.clientY - viewport.panY });
        clearSelection();
      }
    },
    [activeTool, viewport, clearSelection]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setViewport({
          panX: e.clientX - panStart.x,
          panY: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart, setViewport]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
      }
      // Zoom with + and -
      if (e.key === '+' || e.key === '=') {
        setViewport({ zoom: Math.min(3, viewport.zoom + 0.1) });
      }
      if (e.key === '-') {
        setViewport({ zoom: Math.max(0.25, viewport.zoom - 0.1) });
      }
      // Reset zoom with 0
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setViewport({ zoom: 1, panX: 0, panY: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewport, setViewport, clearSelection]);

  const renderCard = (card: CardType) => {
    switch (card.type) {
      case 'text':
        return <TextCard key={card.id} card={card} />;
      case 'media':
        return <MediaCard key={card.id} card={card} />;
      case 'link':
        return <LinkCard key={card.id} card={card} />;
      default:
        return null;
    }
  };

  if (!activeBoard) {
    return (
      <div className={`flex items-center justify-center h-full bg-canvas-bg ${className}`}>
        <p className="text-muted-foreground">No board selected. Create or select a board to get started.</p>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className={`
        relative w-full h-full overflow-hidden 
        bg-canvas-bg canvas-grid
        ${isPanning ? 'cursor-grabbing' : activeTool === 'pan' ? 'cursor-grab' : 'cursor-default'}
        ${className}
      `}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Transform container for zoom and pan */}
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
        }}
      >
        {/* Connection Layer (SVG) */}
        <ConnectionLayer />

        {/* Sections */}
        {activeBoard.sections.map((section) => (
          <Section key={section.id} section={section}>
            {activeBoard.cards
              .filter((card) => card.sectionId === section.id)
              .map(renderCard)}
          </Section>
        ))}

        {/* Cards without sections */}
        {activeBoard.cards.filter((card) => !card.sectionId).map(renderCard)}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-card/90 backdrop-blur-sm rounded-lg text-sm font-medium shadow-sm">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
}
