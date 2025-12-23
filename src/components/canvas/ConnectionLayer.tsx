'use client';

import React, { useMemo } from 'react';
import { useCanvasStore } from '@/store/canvas-store';

export function ConnectionLayer() {
  const { activeBoard } = useCanvasStore();

  // Calculate bezier paths for all connections
  const connectionPaths = useMemo(() => {
    if (!activeBoard) return [];

    return activeBoard.connections.map((connection) => {
      const fromCard = activeBoard.cards.find((c) => c.id === connection.from.cardId);
      const toCard = activeBoard.cards.find((c) => c.id === connection.to.cardId);

      if (!fromCard || !toCard) return null;

      // Calculate anchor positions based on card position and anchor type
      const getAnchorPoint = (
        cardPosition: { x: number; y: number },
        anchor: 'top' | 'right' | 'bottom' | 'left'
      ) => {
        // Assuming card size of 260x150 (average)
        const cardWidth = 260;
        const cardHeight = 150;

        switch (anchor) {
          case 'top':
            return { x: cardPosition.x + cardWidth / 2, y: cardPosition.y };
          case 'right':
            return { x: cardPosition.x + cardWidth, y: cardPosition.y + cardHeight / 2 };
          case 'bottom':
            return { x: cardPosition.x + cardWidth / 2, y: cardPosition.y + cardHeight };
          case 'left':
            return { x: cardPosition.x, y: cardPosition.y + cardHeight / 2 };
        }
      };

      const from = getAnchorPoint(fromCard.position, connection.from.position);
      const to = getAnchorPoint(toCard.position, connection.to.position);

      // Calculate control points for smooth bezier curve
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const curvature = Math.min(distance * 0.4, 100);

      // Control points based on anchor positions
      const getControlPointOffset = (anchor: 'top' | 'right' | 'bottom' | 'left') => {
        switch (anchor) {
          case 'top':
            return { x: 0, y: -curvature };
          case 'right':
            return { x: curvature, y: 0 };
          case 'bottom':
            return { x: 0, y: curvature };
          case 'left':
            return { x: -curvature, y: 0 };
        }
      };

      const fromOffset = getControlPointOffset(connection.from.position);
      const toOffset = getControlPointOffset(connection.to.position);

      const cp1 = { x: from.x + fromOffset.x, y: from.y + fromOffset.y };
      const cp2 = { x: to.x + toOffset.x, y: to.y + toOffset.y };

      const path = `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;

      return {
        id: connection.id,
        path,
        from,
        to,
        color: connection.color,
      };
    }).filter(Boolean);
  }, [activeBoard]);

  if (!activeBoard || connectionPaths.length === 0) {
    return null;
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 5 }}
    >
      <defs>
        {/* Arrow marker for connection ends */}
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--connection)" />
        </marker>

        {/* Glow filter for hover state */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connectionPaths.map((conn) => (
        <g key={conn!.id} className="group/connection pointer-events-auto">
          {/* Invisible wider path for easier interaction */}
          <path
            d={conn!.path}
            className="stroke-transparent fill-none cursor-pointer"
            strokeWidth="16"
          />

          {/* Visible connection line */}
          <path
            d={conn!.path}
            className="connection-line transition-all duration-200"
            style={conn!.color ? { stroke: conn!.color } : undefined}
            markerEnd="url(#arrow)"
          />

          {/* Endpoint circles */}
          <circle
            cx={conn!.from.x}
            cy={conn!.from.y}
            r="4"
            className="fill-card stroke-connection stroke-2"
          />
          <circle
            cx={conn!.to.x}
            cy={conn!.to.y}
            r="4"
            className="fill-card stroke-connection stroke-2"
          />
        </g>
      ))}
    </svg>
  );
}
