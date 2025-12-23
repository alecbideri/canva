'use client';

import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '@/store/canvas-store';
import { FolderCard, StandaloneCard, FilterBar } from '@/components/home';
import { Plus, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import type { Card } from '@/types/canvas';

type FilterType = 'all' | 'tagged' | 'completed';

export default function HomePage() {
  const router = useRouter();
  const { boards, createBoard, loadFromLocalStorage } = useCanvasStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [newBoardName, setNewBoardName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Get all standalone cards (cards without sections from all boards)
  const standaloneCards: Card[] = mounted
    ? boards.flatMap((board) =>
      board.cards.filter((card) => !card.sectionId)
    )
    : [];

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      const board = createBoard(newBoardName.trim());
      setNewBoardName('');
      setIsDialogOpen(false);
      router.push(`/canvas/${board.id}`);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Messy Ideas</h1>
          </div>

          <div className="flex items-center gap-3">
            <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Boards Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Your Boards</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Board
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Board</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Board name..."
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateBoard} disabled={!newBoardName.trim()}>
                      Create Board
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {boards.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No boards yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first board to start organizing your messy ideas with cards, sections, and connections.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Board
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {boards.map((board) => (
                <FolderCard key={board.id} board={board} />
              ))}
            </div>
          )}
        </section>

        {/* Standalone Cards Section */}
        {standaloneCards.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-6">Quick Notes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {standaloneCards.map((card) => (
                <StandaloneCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
