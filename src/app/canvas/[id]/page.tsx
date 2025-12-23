'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCanvasStore } from '@/store/canvas-store';
import { Canvas, CanvasHeader, CanvasToolbar } from '@/components/canvas';

export default function CanvasPage() {
  const params = useParams();
  const boardId = params.id as string;
  const [mounted, setMounted] = useState(false);

  const {
    activeBoard,
    setActiveBoard,
    loadFromLocalStorage,
    addSection,
    addCard,
  } = useCanvasStore();

  useEffect(() => {
    setMounted(true);
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  useEffect(() => {
    if (mounted && boardId) {
      setActiveBoard(boardId);
    }
  }, [mounted, boardId, setActiveBoard]);

  // Create demo content if board is empty
  useEffect(() => {
    if (mounted && activeBoard && activeBoard.sections.length === 0 && activeBoard.cards.length === 0) {
      // Add demo sections
      addSection({
        name: 'OpenAI\'s Strategy',
        position: { x: 100, y: 100 },
        bounds: { x: 100, y: 100, width: 500, height: 400 },
        isCollapsed: false,
      });

      addSection({
        name: 'Developer Ecosystem',
        position: { x: 650, y: 80 },
        bounds: { x: 650, y: 80, width: 450, height: 350 },
        isCollapsed: false,
      });

      addSection({
        name: 'AI Landscape',
        position: { x: 100, y: 550 },
        bounds: { x: 100, y: 550, width: 550, height: 300 },
        isCollapsed: false,
      });

      // Add demo cards
      setTimeout(() => {
        const store = useCanvasStore.getState();
        const sections = store.activeBoard?.sections || [];

        if (sections.length >= 3) {
          // Cards for OpenAI's Strategy section
          store.addCard({
            type: 'text',
            title: 'What is OpenAI\'s new moat',
            content: 'What is OpenAI\'s moat now that the LLMs are becoming commoditized? Foundational models are becoming widely available and losing the unique value they once had.',
            position: { x: 120, y: 140 },
            sectionId: sections[0].id,
            accentColor: '#E8F5F0',
          });

          store.addCard({
            type: 'text',
            title: 'OpenAI\'s hardware disadvantage',
            content: 'How does OpenAI fare against hardware-focused companies? Their focus is purely in gen AI models and software.',
            position: { x: 350, y: 280 },
            sectionId: sections[0].id,
          });

          // Cards for Developer Ecosystem
          store.addCard({
            type: 'text',
            title: 'Developer Platforms for OpenAI',
            content: 'By serving as a platform and allowing developers to build on top of OpenAI\'s products, we can rapidly increase value to end-users.',
            position: { x: 670, y: 120 },
            sectionId: sections[1].id,
          });

          store.addCard({
            type: 'text',
            title: 'Agentic AI and dev ecosystems',
            content: 'And with agentic AI, everyone is racing to the bottom of the stack—that\'s where you benefit from "defaults".',
            position: { x: 870, y: 120 },
            sectionId: sections[1].id,
            accentColor: '#FFF8E7',
          });

          // Cards for AI Landscape
          store.addCard({
            type: 'text',
            title: 'What AI unlocks in hardware',
            content: 'Hyper-personalization → can take place through the context-capturing power of always-on cameras and mics.',
            position: { x: 120, y: 590 },
            sectionId: sections[2].id,
            accentColor: '#E8F5F0',
          });

          store.addCard({
            type: 'text',
            title: 'Is the future gonna be human-brain interaction?',
            content: 'Who will be the first to get to it? The human-pin was really good in concept/theory, but poor innovation.',
            position: { x: 380, y: 590 },
            sectionId: sections[2].id,
          });

          // Add a connection between cards
          setTimeout(() => {
            const latestStore = useCanvasStore.getState();
            const cards = latestStore.activeBoard?.cards || [];
            if (cards.length >= 2) {
              latestStore.addConnection(
                { cardId: cards[0].id, position: 'bottom' },
                { cardId: cards[1].id, position: 'top' }
              );
            }
            if (cards.length >= 4) {
              latestStore.addConnection(
                { cardId: cards[2].id, position: 'right' },
                { cardId: cards[3].id, position: 'left' }
              );
            }
          }, 100);
        }
      }, 100);
    }
  }, [mounted, activeBoard, addSection, addCard]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading canvas...</div>
      </div>
    );
  }

  if (!activeBoard) {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Board not found</p>
          <a href="/" className="text-primary hover:underline">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-bg">
      <CanvasHeader />
      <div className="pt-14 h-screen">
        <Canvas className="h-full" />
      </div>
      <CanvasToolbar />
    </div>
  );
}
