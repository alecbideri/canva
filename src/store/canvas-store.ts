import { create } from 'zustand';
import {
  CanvasBoard,
  Card,
  Section,
  Connection,
  Position,
  CanvasTool,
  CanvasViewport as ViewportState,
  SelectionState,
  ConnectionAnchor,
  DragState
} from '@/types/canvas';

// --- Mappers ---

const mapPrismaSection = (pSection: any): Section => ({
  id: pSection.id,
  name: pSection.name,
  position: { x: pSection.posX, y: pSection.posY },
  bounds: { x: pSection.posX, y: pSection.posY, width: pSection.width, height: pSection.height },
  color: pSection.color || undefined,
  isCollapsed: pSection.isCollapsed,
  createdAt: new Date(pSection.createdAt),
  updatedAt: new Date(pSection.updatedAt)
});

const mapPrismaCard = (pCard: any): Card => ({
  id: pCard.id,
  type: 'text',
  title: pCard.note.title,
  content: pCard.note.content,
  position: { x: pCard.posX, y: pCard.posY },
  sectionId: pCard.sectionId,
  createdAt: new Date(pCard.createdAt),
  updatedAt: new Date(pCard.updatedAt),
  accentColor: pCard.note.accentColor || pCard.note.color || undefined
});

const mapPrismaConnection = (pConn: any): Connection => ({
  id: pConn.id,
  from: { cardId: pConn.fromCardId, position: pConn.fromAnchor as any },
  to: { cardId: pConn.toCardId, position: pConn.toAnchor as any },
  color: pConn.color || undefined,
  label: pConn.label || undefined,
  createdAt: new Date(pConn.createdAt)
});

// --- Store Interface ---

interface CanvasStore {
  boards: CanvasBoard[];
  activeBoard: CanvasBoard | null;
  viewport: ViewportState;
  activeTool: CanvasTool;
  selection: SelectionState;
  dragState: DragState;
  isLoading: boolean;
  error: string | null;

  // Board Actions
  loadBoards: () => Promise<void>;
  loadBoard: (boardId: string) => Promise<void>;
  setActiveBoard: (boardId: string) => Promise<void>;
  createBoard: (name: string) => Promise<string>;
  deleteBoard: (boardId: string) => Promise<void>;

  // Viewport
  setViewport: (viewport: Partial<ViewportState>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Tools & Selection
  setActiveTool: (tool: CanvasTool) => void;
  setSelection: (selection: SelectionState) => void;
  selectCard: (cardId: string, addToSelection?: boolean) => void;
  selectSection: (sectionId: string, addToSelection?: boolean) => void;
  clearSelection: () => void;

  // Dragging
  startDrag: (type: 'card' | 'section' | 'connection', id: string, position: Position) => void;
  updateDrag: (position: Position) => void;
  endDrag: () => void;

  // Content Actions
  addSection: (sectionData: any) => Promise<void>;
  updateSection: (sectionId: string, updates: Partial<Section>) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;

  addCard: (cardData: any) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  updateCardPosition: (cardId: string, position: Position) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  duplicateCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, position: Position, sectionId?: string | null) => void;

  addConnection: (from: ConnectionAnchor, to: ConnectionAnchor) => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
}

// --- Store Implementation ---

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  boards: [],
  activeBoard: null,
  viewport: { zoom: 1, panX: 0, panY: 0 },
  activeTool: 'select',
  selection: { selectedCardIds: [], selectedSectionIds: [], selectedConnectionIds: [] },
  dragState: { isDragging: false, dragType: null, draggedId: null, startPosition: null, currentPosition: null },
  isLoading: false,
  error: null,

  loadBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/boards');
      if (!res.ok) throw new Error('Failed to fetch boards');
      const data = await res.json();

      // Map basic board info (we don't need full details for list)
      const boards = data.map((b: any) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        thumbnail: b.thumbnail,
        sections: [], // Empty for list view
        cards: [],
        connections: [],
        viewport: { zoom: 1, panX: 0, panY: 0 },
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt)
      }));

      set({ boards, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to load boards', isLoading: false });
    }
  },

  loadBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) throw new Error('Failed to fetch board');

      const data = await res.json();

      const board: CanvasBoard = {
        id: data.id,
        name: data.name,
        description: data.description,
        thumbnail: data.thumbnail,
        sections: data.sections.map(mapPrismaSection),
        cards: data.cards.map(mapPrismaCard),
        connections: data.connections.map(mapPrismaConnection),
        viewport: {
          zoom: data.zoom || 1,
          panX: data.panX || 0,
          panY: data.panY || 0
        },
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      };

      set({ activeBoard: board, viewport: board.viewport, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to load board', isLoading: false });
    }
  },

  setActiveBoard: async (boardId: string) => {
    await get().loadBoard(boardId);
  },

  createBoard: async (name: string) => {
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      return data.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteBoard: async (boardId: string) => {
    // Implementation skipped for now
  },

  setViewport: (updates) => {
    set(state => ({ viewport: { ...state.viewport, ...updates } }));
  },

  zoomIn: () => set((state) => ({
    viewport: { ...state.viewport, zoom: Math.min(state.viewport.zoom + 0.1, 2) }
  })),

  zoomOut: () => set((state) => ({
    viewport: { ...state.viewport, zoom: Math.max(state.viewport.zoom - 0.1, 0.1) }
  })),

  resetZoom: () => set((state) => ({
    viewport: { ...state.viewport, zoom: 1 }
  })),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setSelection: (selection) => set({ selection }),

  selectCard: (cardId, addToSelection = false) => set(state => {
    if (addToSelection) {
      return { selection: { ...state.selection, selectedCardIds: [...state.selection.selectedCardIds, cardId] } };
    }
    return { selection: { ...state.selection, selectedCardIds: [cardId], selectedSectionIds: [], selectedConnectionIds: [] } };
  }),

  selectSection: (sectionId, addToSelection = false) => set(state => {
    // Similar to selectCard
    return { selection: { ...state.selection, selectedSectionIds: [sectionId] } };
  }),

  clearSelection: () => set({ selection: { selectedCardIds: [], selectedSectionIds: [], selectedConnectionIds: [] } }),

  startDrag: (type, id, position) => set({
    dragState: {
      isDragging: true,
      dragType: type,
      draggedId: id,
      startPosition: position,
      currentPosition: position
    }
  }),

  updateDrag: (position) => set(state => ({
    dragState: { ...state.dragState, currentPosition: position }
  })),

  endDrag: () => {
    const { dragState, updateCardPosition, updateSection } = get();

    // Commit the change if we were dragging something
    if (dragState.isDragging && dragState.draggedId && dragState.currentPosition) {
      // Logic handled mostly by drop handlers in components, 
      // but strictly speaking we should commit here?
      // Currently components call updateCardPosition/Section on drag end.
      // So we just clear state.
    }

    set({
      dragState: {
        isDragging: false,
        dragType: null,
        draggedId: null,
        startPosition: null,
        currentPosition: null
      }
    });
  },

  addSection: async (sectionData) => {
    const { activeBoard } = get();
    if (!activeBoard) return;

    // Optimistic update?
    // Let's just wait for server for creation to get ID
    const res = await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boardId: activeBoard.id,
        name: sectionData.name,
        posX: sectionData.position?.x || sectionData.bounds?.x || 0,
        posY: sectionData.position?.y || sectionData.bounds?.y || 0,
        width: sectionData.bounds?.width || 400,
        height: sectionData.bounds?.height || 300,
        color: sectionData.color
      })
    });
    const newSection = await res.json();

    set(state => ({
      activeBoard: state.activeBoard ? {
        ...state.activeBoard,
        sections: [...state.activeBoard.sections, mapPrismaSection(newSection)]
      } : null
    }));
  },

  updateSection: async (sectionId, updates) => {
    // Optimistic
    set(state => {
      if (!state.activeBoard) return state;
      return {
        activeBoard: {
          ...state.activeBoard,
          sections: state.activeBoard.sections.map(s =>
            s.id === sectionId ? { ...s, ...updates } : s
          )
        }
      };
    });

    // API call
    await fetch(`/api/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: updates.name,
        posX: updates.position?.x,
        posY: updates.position?.y,
        width: updates.bounds?.width,
        height: updates.bounds?.height,
        isCollapsed: updates.isCollapsed,
        color: updates.color
      })
    });
  },

  deleteSection: async (sectionId) => {
    // Optimistic delete
    set(state => {
      if (!state.activeBoard) return state;
      return {
        activeBoard: {
          ...state.activeBoard,
          sections: state.activeBoard.sections.filter(s => s.id !== sectionId),
          // Also set sectionId to null for cards in this section
          cards: state.activeBoard.cards.map(c =>
            c.sectionId === sectionId ? { ...c, sectionId: null } : c
          )
        }
      };
    });

    await fetch(`/api/sections/${sectionId}`, { method: 'DELETE' });
  },

  addCard: async (cardData) => {
    const { activeBoard } = get();
    if (!activeBoard) return;

    // API Call
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boardId: activeBoard.id,
        sectionId: cardData.sectionId,
        posX: cardData.position?.x || 0,
        posY: cardData.position?.y || 0,
        title: cardData.title,
        content: cardData.content,
        // Optional noteId if we're adding an existing note
        noteId: cardData.noteId
      })
    });

    if (!res.ok) {
      console.error("Failed to add card");
      return;
    }

    const newCard = await res.json();

    set(state => ({
      activeBoard: state.activeBoard ? {
        ...state.activeBoard,
        cards: [...state.activeBoard.cards, mapPrismaCard(newCard)]
      } : null
    }));
  },

  duplicateCard: async (cardId) => {
    const { activeBoard } = get();
    if (!activeBoard) return;

    const card = activeBoard.cards.find(c => c.id === cardId);
    if (!card) return;

    // Call addCard with offset
    get().addCard({
      ...card,
      noteId: undefined,
      title: (card as any).title ? `${(card as any).title} (Copy)` : 'Copy',
      content: (card as any).content,
      position: { x: card.position.x + 20, y: card.position.y + 20 },
      sectionId: card.sectionId
    });
  },

  updateCard: async (cardId, updates) => {
    // Implement similar to updateSection
    // ...
  },

  moveCard: (cardId, position, sectionId) => {
    // Optimistic move (local state only)
    set(state => {
      if (!state.activeBoard) return state;
      return {
        activeBoard: {
          ...state.activeBoard,
          cards: state.activeBoard.cards.map(c =>
            c.id === cardId
              ? { ...c, position, sectionId: sectionId === undefined ? c.sectionId : sectionId }
              : c
          )
        }
      };
    });
  },

  updateCardPosition: async (cardId, position) => {
    // Call moveCard first for immediate UI feedback (idempotent if already moved)
    get().moveCard(cardId, position);

    // Then API
    const { activeBoard } = get();
    const card = activeBoard?.cards.find(c => c.id === cardId);

    await fetch(`/api/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        posX: position.x,
        posY: position.y,
        sectionId: card?.sectionId
      })
    });
  },

  deleteCard: async (cardId) => {
    set(state => ({
      activeBoard: state.activeBoard ? {
        ...state.activeBoard,
        cards: state.activeBoard.cards.filter(c => c.id !== cardId),
        // Remove connections attached to this card
        connections: state.activeBoard.connections.filter(c =>
          c.from.cardId !== cardId && c.to.cardId !== cardId
        )
      } : null
    }));

    await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
  },

  addConnection: async (from, to) => {
    const { activeBoard } = get();
    if (!activeBoard) return;

    // Check if exists
    // ...

    const res = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        boardId: activeBoard.id,
        fromCardId: from.cardId,
        toCardId: to.cardId,
        fromAnchor: from.position,
        toAnchor: to.position
      })
    });

    if (!res.ok) return;

    const newConn = await res.json();

    set(state => ({
      activeBoard: state.activeBoard ? {
        ...state.activeBoard,
        connections: [...state.activeBoard.connections, mapPrismaConnection(newConn)]
      } : null
    }));
  },

  deleteConnection: async (connectionId) => {
    set(state => ({
      activeBoard: state.activeBoard ? {
        ...state.activeBoard,
        connections: state.activeBoard.connections.filter(c => c.id !== connectionId)
      } : null
    }));

    await fetch(`/api/connections/${connectionId}`, { method: 'DELETE' });
  }

}));
