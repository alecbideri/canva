import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  CanvasState,
  CanvasBoard,
  Section,
  Card,
  Connection,
  ConnectionAnchor,
  Position,
  CanvasViewport,
  CanvasTool,
} from '@/types/canvas';

const DEFAULT_VIEWPORT: CanvasViewport = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      // Initial state
      boards: [],
      activeBoard: null,
      viewport: DEFAULT_VIEWPORT,
      activeTool: 'select',
      dragState: {
        isDragging: false,
        dragType: null,
        draggedId: null,
        startPosition: null,
        currentPosition: null,
      },
      selection: {
        selectedCardIds: [],
        selectedSectionIds: [],
        selectedConnectionIds: [],
      },

      // Board Actions
      setActiveBoard: (boardId: string) => {
        const board = get().boards.find((b) => b.id === boardId);
        if (board) {
          set({ activeBoard: board, viewport: board.viewport });
        }
      },

      createBoard: (name: string) => {
        const newBoard: CanvasBoard = {
          id: uuidv4(),
          name,
          sections: [],
          cards: [],
          connections: [],
          viewport: DEFAULT_VIEWPORT,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          boards: [...state.boards, newBoard],
          activeBoard: newBoard,
        }));
        return newBoard;
      },

      deleteBoard: (boardId: string) => {
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== boardId),
          activeBoard: state.activeBoard?.id === boardId ? null : state.activeBoard,
        }));
      },

      // Section Actions
      addSection: (sectionData) => {
        const newSection: Section = {
          ...sectionData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => {
          if (!state.activeBoard) return state;
          const updatedBoard = {
            ...state.activeBoard,
            sections: [...state.activeBoard.sections, newSection],
            updatedAt: new Date(),
          };
          return {
            activeBoard: updatedBoard,
            boards: state.boards.map((b) =>
              b.id === updatedBoard.id ? updatedBoard : b
            ),
          };
        });
      },

      updateSection: (sectionId: string, updates: Partial<Section>) => {
        set((state) => {
          if (!state.activeBoard) return state;
          const updatedSections = state.activeBoard.sections.map((s) =>
            s.id === sectionId ? { ...s, ...updates, updatedAt: new Date() } : s
          );
          const updatedBoard = {
            ...state.activeBoard,
            sections: updatedSections,
            updatedAt: new Date(),
          };
          return {
            activeBoard: updatedBoard,
            boards: state.boards.map((b) =>
              b.id === updatedBoard.id ? updatedBoard : b
            ),
          };
        });
      },

      deleteSection: (sectionId: string) => {
        set((state) => {
          if (!state.activeBoard) return state;
          // Move cards from this section to no section
          const updatedCards = state.activeBoard.cards.map((c) =>
            c.sectionId === sectionId ? { ...c, sectionId: null } : c
          );
          const updatedBoard = {
            ...state.activeBoard,
            sections: state.activeBoard.sections.filter((s) => s.id !== sectionId),
            cards: updatedCards,
            updatedAt: new Date(),
          };
          return {
            activeBoard: updatedBoard,
            boards: state.boards.map((b) =>
              b.id === updatedBoard.id ? updatedBoard : b
            ),
          };
        });
      },

      // Card Actions
      addCard: (cardData) => {
        const newCard = {
          ...cardData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Card;
        set((state) => {
          if (!state.activeBoard) return state;
          const updatedBoard = {
            ...state.activeBoard,
            cards: [...state.activeBoard.cards, newCard],
            updatedAt: new Date(),
          };
          return {
            activeBoard: updatedBoard,
            boards: state.boards.map((b) =>
              b.id === updatedBoard.id ? updatedBoard : b
            ),
          };
        });
      },

      updateCard: (cardId: string, updates: Partial<Card>) => {
        set((state) => {
          if (!state.activeBoard) return state;
          const updatedCards = state.activeBoard.cards.map((c) =>
            c.id === cardId ? { ...c, ...updates, updatedAt: new Date() } : c
          ) as Card[];
          const updatedBoard = {
            ...state.activeBoard,
            cards: updatedCards,
            updatedAt: new Date(),
          };
          return {
            activeBoard: updatedBoard,
            boards: state.boards.map((b) =>
              b.id === updatedBoard.id ? updatedBoard : b
            ),
          };
        });
      },

      deleteCard: (cardId: string) => {
        set((state) => {
          if (!state.activeBoard) return state;
          // Also remove any connections involving this card
          const updatedConnections = state.activeBoard.connections.filter(
            (c) => c.from.cardId !== cardId && c.to.cardId !== cardId
          );
          const updatedBoard = {
            ...state.activeBoard,
            cards: state.activeBoard.cards.filter((c) => c.id !== cardId),
            connections: updatedConnections,
            updatedAt: new Date(),
          };
          return {
            activeBoard: updatedBoard,
            boards: state.boards.map((b) =>
              b.id === updatedBoard.id ? updatedBoard : b
            ),
            selection: {
              ...state.selection,
              selectedCardIds: state.selection.selectedCardIds.filter(
                (id) => id !== cardId
              ),
            },
          };
        });
      },

      moveCard: (cardId: string, position: Position, sectionId?: string | null) => {
        set((state) => {
          if (!state.activeBoard) return state;
          const updatedCards = state.activeBoard.cards.map((c) =>
            c.id === cardId
              ? {
                ...c,
                position,
                sectionId: sectionId !== undefined ? sectionId : c.sectionId,
                updatedAt: new Date(),
              }
              : c
          ) as Card[];
          const updatedBoard = {
            ...state.activeBoard,
            cards: updatedCards,
            updatedAt: new Date(),
          };
          return {
            activeBoard: updatedBoard,
            boards: state.boards.map((b) =>
              b.id === updatedBoard.id ? updatedBoard : b
            ),
          };
        });
      },

      // Connection Actions
      addConnection: (from: ConnectionAnchor, to: ConnectionAnchor) => {
        // Prevent self-connections and duplicate connections
        if (from.cardId === to.cardId) return;

        const state = get();
        if (!state.activeBoard) return;

        const exists = state.activeBoard.connections.some(
          (c) =>
            (c.from.cardId === from.cardId && c.to.cardId === to.cardId) ||
            (c.from.cardId === to.cardId && c.to.cardId === from.cardId)
        );
        if (exists) return;

        const newConnection: Connection = {
          id: uuidv4(),
          from,
          to,
          createdAt: new Date(),
        };
        set((state) => {
          if (!state.activeBoard) return state;
          const updatedBoard = {
            ...state.activeBoard,
            connections: [...state.activeBoard.connections, newConnection],
            updatedAt: new Date(),
          };
          return {
            activeBoard: updatedBoard,
            boards: state.boards.map((b) =>
              b.id === updatedBoard.id ? updatedBoard : b
            ),
          };
        });
      },

      deleteConnection: (connectionId: string) => {
        set((state) => {
          if (!state.activeBoard) return state;
          const updatedBoard = {
            ...state.activeBoard,
            connections: state.activeBoard.connections.filter(
              (c) => c.id !== connectionId
            ),
            updatedAt: new Date(),
          };
          return {
            activeBoard: updatedBoard,
            boards: state.boards.map((b) =>
              b.id === updatedBoard.id ? updatedBoard : b
            ),
          };
        });
      },

      // Viewport Actions
      setViewport: (viewport: Partial<CanvasViewport>) => {
        set((state) => ({
          viewport: { ...state.viewport, ...viewport },
        }));
      },

      zoomIn: () => {
        set((state) => ({
          viewport: {
            ...state.viewport,
            zoom: Math.min(state.viewport.zoom + ZOOM_STEP, MAX_ZOOM),
          },
        }));
      },

      zoomOut: () => {
        set((state) => ({
          viewport: {
            ...state.viewport,
            zoom: Math.max(state.viewport.zoom - ZOOM_STEP, MIN_ZOOM),
          },
        }));
      },

      resetZoom: () => {
        set({ viewport: DEFAULT_VIEWPORT });
      },

      // Tool Actions
      setActiveTool: (tool: CanvasTool) => {
        set({ activeTool: tool });
      },

      // Selection Actions
      selectCard: (cardId: string, addToSelection = false) => {
        set((state) => ({
          selection: {
            ...state.selection,
            selectedCardIds: addToSelection
              ? state.selection.selectedCardIds.includes(cardId)
                ? state.selection.selectedCardIds.filter((id) => id !== cardId)
                : [...state.selection.selectedCardIds, cardId]
              : [cardId],
          },
        }));
      },

      selectSection: (sectionId: string, addToSelection = false) => {
        set((state) => ({
          selection: {
            ...state.selection,
            selectedSectionIds: addToSelection
              ? state.selection.selectedSectionIds.includes(sectionId)
                ? state.selection.selectedSectionIds.filter((id) => id !== sectionId)
                : [...state.selection.selectedSectionIds, sectionId]
              : [sectionId],
          },
        }));
      },

      clearSelection: () => {
        set({
          selection: {
            selectedCardIds: [],
            selectedSectionIds: [],
            selectedConnectionIds: [],
          },
        });
      },

      // Drag Actions
      startDrag: (type, id, position) => {
        set({
          dragState: {
            isDragging: true,
            dragType: type,
            draggedId: id,
            startPosition: position,
            currentPosition: position,
          },
        });
      },

      updateDrag: (position: Position) => {
        set((state) => ({
          dragState: {
            ...state.dragState,
            currentPosition: position,
          },
        }));
      },

      endDrag: () => {
        set({
          dragState: {
            isDragging: false,
            dragType: null,
            draggedId: null,
            startPosition: null,
            currentPosition: null,
          },
        });
      },

      // Persistence
      saveToLocalStorage: () => {
        const state = get();
        localStorage.setItem(
          'messy-ideas-canvas',
          JSON.stringify({
            boards: state.boards,
            activeBoard: state.activeBoard,
          })
        );
      },

      loadFromLocalStorage: () => {
        try {
          const saved = localStorage.getItem('messy-ideas-canvas');
          if (saved) {
            const data = JSON.parse(saved);
            set({
              boards: data.boards || [],
              activeBoard: data.activeBoard || null,
            });
          }
        } catch (error) {
          console.error('Failed to load from localStorage:', error);
        }
      },
    }),
    {
      name: 'messy-ideas-canvas',
      partialize: (state) => ({
        boards: state.boards,
      }),
    }
  )
);
