'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import type { Section as SectionType } from '@/types/canvas';
import { GripVertical, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SectionProps {
  section: SectionType;
  children?: React.ReactNode;
}

export function Section({ section, children }: SectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const {
    updateSection,
    deleteSection,
    selection,
    selectSection,
    startDrag,
    updateDrag,
    endDrag,
  } = useCanvasStore();

  const isSelected = selection.selectedSectionIds.includes(section.id);

  const handleNameSubmit = () => {
    if (editName.trim()) {
      updateSection(section.id, { name: editName.trim() });
    } else {
      setEditName(section.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
    if (e.key === 'Escape') {
      setEditName(section.name);
      setIsEditing(false);
    }
  };

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDragging(true);
      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - section.position.x,
          y: e.clientY - section.position.y,
        });
      }
      startDrag('section', section.id, section.position);
    },
    [section, startDrag]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        updateSection(section.id, { position: { x: newX, y: newY } });
        updateDrag({ x: newX, y: newY });
      }
    },
    [isDragging, dragOffset, section.id, updateSection, updateDrag]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    endDrag();
  }, [endDrag]);

  const toggleCollapse = () => {
    updateSection(section.id, { isCollapsed: !section.isCollapsed });
  };

  return (
    <div
      ref={sectionRef}
      className={`
        absolute section-border rounded-2xl p-4 min-w-[300px] min-h-[200px]
        bg-section-bg backdrop-blur-sm
        transition-shadow duration-200
        ${isSelected ? 'ring-2 ring-primary/50 shadow-lg' : ''}
        ${isDragging ? 'opacity-80 shadow-2xl' : ''}
      `}
      style={{
        left: section.position.x,
        top: section.position.y,
        width: section.bounds.width,
        height: section.isCollapsed ? 'auto' : section.bounds.height,
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectSection(section.id, e.shiftKey);
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3">
        {/* Drag Handle */}
        <button
          className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Collapse Toggle */}
        <button
          className="p-1 rounded hover:bg-muted"
          onClick={toggleCollapse}
        >
          {section.isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Section Name */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 text-sm font-semibold bg-transparent border-b border-primary outline-none"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold text-foreground cursor-text hover:text-primary transition-colors"
            onDoubleClick={() => setIsEditing(true)}
          >
            {section.name}
          </span>
        )}

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteSection(section.id)}
              className="text-destructive"
            >
              Delete Section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Section Content */}
      {!section.isCollapsed && (
        <div className="relative min-h-[120px]">
          {children}
        </div>
      )}
    </div>
  );
}
