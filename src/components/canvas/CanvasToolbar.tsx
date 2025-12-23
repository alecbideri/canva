'use client';

import React from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import type { CanvasTool } from '@/types/canvas';
import {
  MousePointer2,
  Hand,
  Type,
  StickyNote,
  Square,
  Plus,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ToolButtonProps {
  tool: CanvasTool;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

function ToolButton({ tool, icon, label, shortcut }: ToolButtonProps) {
  const { activeTool, setActiveTool } = useCanvasStore();
  const isActive = activeTool === tool;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`
              p-2.5 rounded-lg transition-all duration-150
              ${isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }
            `}
            onClick={() => setActiveTool(tool)}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="flex items-center gap-2">
          <span>{label}</span>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">
              {shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function CanvasToolbar() {
  const { viewport, zoomIn, zoomOut, resetZoom, addCard, activeBoard } = useCanvasStore();

  const handleAddTextCard = () => {
    if (!activeBoard) return;

    // Add card at center of viewport
    const centerX = (-viewport.panX + window.innerWidth / 2) / viewport.zoom;
    const centerY = (-viewport.panY + window.innerHeight / 2) / viewport.zoom;

    addCard({
      type: 'text',
      title: 'New Note',
      content: 'Start typing...',
      position: { x: centerX - 130, y: centerY - 75 },
      sectionId: null,
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 px-2 py-1.5 bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-border/50">
        {/* Selection & Pan Tools */}
        <ToolButton
          tool="select"
          icon={<MousePointer2 className="w-5 h-5" />}
          label="Select"
          shortcut="V"
        />
        <ToolButton
          tool="pan"
          icon={<Hand className="w-5 h-5" />}
          label="Pan"
          shortcut="H"
        />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Creation Tools */}
        <ToolButton
          tool="text"
          icon={<Type className="w-5 h-5" />}
          label="Text"
          shortcut="T"
        />
        <ToolButton
          tool="note"
          icon={<StickyNote className="w-5 h-5" />}
          label="Note"
          shortcut="N"
        />
        <ToolButton
          tool="shape"
          icon={<Square className="w-5 h-5" />}
          label="Section"
          shortcut="S"
        />

        <div className="w-px h-6 bg-border mx-1" />

        {/* Zoom Controls */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={zoomOut}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Zoom Out</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <button
          className="px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground min-w-[52px] text-center"
          onClick={resetZoom}
        >
          {Math.round(viewport.zoom * 100)}%
        </button>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={zoomIn}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Zoom In</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Add Button */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={handleAddTextCard}
              >
                <Plus className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Add Card</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
