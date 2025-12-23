"use client";

import { Button } from "@/components/ui/button";
import { Plus, Layout, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useEffect, useState } from "react";
import { useCanvasStore } from "@/store/canvas-store";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const { boards, createBoard, loadBoards, isLoading } = useCanvasStore();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const handleCreateBoard = async () => {
    setIsCreating(true);
    try {
      const id = await createBoard("Untitled Board");
      router.push(`/canvas/${id}`);
    } catch (error) {
      console.error("Failed to create board", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] relative overflow-hidden">

      {/* Background Pattern */}
      <div className="absolute inset-0 circle-tiles-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-16 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/20 backdrop-blur-sm">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="font-bold text-xl tracking-tight">CANVAid</span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost">Sign In</Button>
          <Button>Get Started</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center text-center max-w-4xl z-10 w-full">
        {boards.length === 0 && !isLoading ? (
          <>
            <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Intelligent Canvas Workspace
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Organize your thoughts <br /> visually.
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Create infinite canvases to brainstorm, plan projects, and connect ideas.
              The most intuitive way to think effectively.
            </p>

            <div className="flex gap-4">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105" onClick={handleCreateBoard} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                {isCreating ? 'Creating...' : 'Create New Board'}
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all">
                View Templates <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full text-left">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Your Boards</h2>
              <Button onClick={handleCreateBoard} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                New Board
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boards.map((board) => (
                  <Link href={`/canvas/${board.id}`} key={board.id} className="group relative block h-48 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-6 relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{board.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{board.description || "No description"}</p>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Layout className="w-3 h-3 mr-1" />
                        Updated {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-sm text-muted-foreground z-10">
        <p>© 2024 CANVAid. All rights reserved.</p>
      </footer>
    </div>
  );
}
