'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import {
  ChevronDown,
  Search,
  Settings,
  Share2,
  Home,
  MoreHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function CanvasHeader() {
  const { activeBoard, boards, setActiveBoard, updateSection } = useCanvasStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(activeBoard?.name || '');

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Home Link */}
          <div className="bg-card/80 backdrop-blur-md border border-border/50">
            <Link
              href="/"
              className="p-2 flex items-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>

          {/* Logo */}
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            CANVA<span className="text-primary">id</span>
          </h1>

          {/* Board Title */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-card/80 backdrop-blur-md border border-border/50 hover:bg-muted transition-colors">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                    className="bg-transparent font-semibold text-foreground outline-none border-b border-primary"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span className="font-semibold text-foreground">
                    {activeBoard?.name || 'Untitled Board'}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Switch Board
              </div>
              {boards.map((board) => (
                <DropdownMenuItem
                  key={board.id}
                  onClick={() => setActiveBoard(board.id)}
                  className={activeBoard?.id === board.id ? 'bg-muted' : ''}
                >
                  {board.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                Rename Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="bg-card/80 backdrop-blur-md border border-border/50">
            {isSearchOpen ? (
              <div className="flex items-center gap-2 p-1">
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-8"
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery) setIsSearchOpen(false);
                  }}
                />
              </div>
            ) : (
              <button
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search</span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="bg-card/80 backdrop-blur-md border border-border/50 flex items-center">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* More */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 bg-card/80 backdrop-blur-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as Image</DropdownMenuItem>
              <DropdownMenuItem>Export as JSON</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
              <DropdownMenuItem>Help & Feedback</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
