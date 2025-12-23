"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@/components/canvas/Canvas";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { CanvasHeader } from "@/components/canvas/CanvasHeader";
import { useCanvasStore } from "@/store/canvas-store";
import { Loader2 } from "lucide-react";

interface CanvasPageProps {
  params: {
    id: string;
  };
}

export default function CanvasPage({ params }: CanvasPageProps) {
  const { loadBoard, activeBoard, isLoading, error } = useCanvasStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadBoard(params.id);
      setIsInitializing(false);
    };
    init();
  }, [params.id, loadBoard]);

  if (isInitializing || isLoading && !activeBoard) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 circle-tiles-bg opacity-40 pointer-events-none" />
        <div className="flex flex-col items-center gap-4 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 circle-tiles-bg opacity-40 pointer-events-none" />
        <div className="text-center z-10">
          <h1 className="text-2xl font-bold mb-2 text-destructive">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 circle-tiles-bg opacity-40 pointer-events-none" />

      <CanvasHeader />

      <main className="flex-1 relative overflow-hidden z-10">
        <Canvas />
      </main>

      <CanvasToolbar />
    </div>
  );
}
