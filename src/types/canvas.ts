// Canvas Application Types

// Distributive Omit helper - applies Omit to each member of a union type individually
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Card Types
export type CardType = 'text' | 'media' | 'link';

export interface BaseCard {
  id: string;
  type: CardType;
  position: Position;
  sectionId: string | null; // null if card is in home/not in a section
  createdAt: Date;
  updatedAt: Date;
}

export interface TextCard extends BaseCard {
  type: 'text';
  title: string;
  content: string;
  accentColor?: string; // Optional accent color for the card
}

export interface MediaCard extends BaseCard {
  type: 'media';
  title?: string;
  imageUrl: string;
  caption?: string;
}

export interface LinkCard extends BaseCard {
  type: 'link';
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  previewImage?: string;
}

export type Card = TextCard | MediaCard | LinkCard;

// Section (Folder) Type
export interface Section {
  id: string;
  name: string;
  position: Position;
  bounds: Bounds;
  color?: string; // Optional accent color
  isCollapsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Connection Types
export type AnchorPosition = 'top' | 'right' | 'bottom' | 'left';

export interface ConnectionAnchor {
  cardId: string;
  position: AnchorPosition;
}

export interface Connection {
  id: string;
  from: ConnectionAnchor;
  to: ConnectionAnchor;
  color?: string;
  label?: string;
  createdAt: Date;
}

// Canvas State
export interface CanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
}

export interface CanvasBoard {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  sections: Section[];
  cards: Card[];
  connections: Connection[];
  viewport: CanvasViewport;
  createdAt: Date;
  updatedAt: Date;
}

// Tool Types
export type CanvasTool =
  | 'select'
  | 'pan'
  | 'text'
  | 'note'
  | 'shape'
  | 'connect';

// Drag State
export interface DragState {
  isDragging: boolean;
  dragType: 'card' | 'section' | 'connection' | null;
  draggedId: string | null;
  startPosition: Position | null;
  currentPosition: Position | null;
}

// Selection State
export interface SelectionState {
  selectedCardIds: string[];
  selectedSectionIds: string[];
  selectedConnectionIds: string[];
}

// Canvas Store State
export interface CanvasState {
  // Data
  boards: CanvasBoard[];
  activeBoard: CanvasBoard | null;

  // UI State
  viewport: CanvasViewport;
  activeTool: CanvasTool;
  dragState: DragState;
  selection: SelectionState;

  // Actions
  setActiveBoard: (boardId: string) => void;
  createBoard: (name: string) => CanvasBoard;
  deleteBoard: (boardId: string) => void;

  // Section Actions
  addSection: (section: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;

  // Card Actions
  addCard: (card: DistributiveOmit<Card, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, position: Position, sectionId?: string | null) => void;

  // Connection Actions
  addConnection: (from: ConnectionAnchor, to: ConnectionAnchor) => void;
  deleteConnection: (connectionId: string) => void;

  // Viewport Actions
  setViewport: (viewport: Partial<CanvasViewport>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Tool Actions
  setActiveTool: (tool: CanvasTool) => void;

  // Selection Actions
  selectCard: (cardId: string, addToSelection?: boolean) => void;
  selectSection: (sectionId: string, addToSelection?: boolean) => void;
  clearSelection: () => void;

  // Drag Actions
  startDrag: (type: 'card' | 'section' | 'connection', id: string, position: Position) => void;
  updateDrag: (position: Position) => void;
  endDrag: () => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

// Home Page Types
export interface FolderPreview {
  board: CanvasBoard;
  previewCards: Card[];
}

export interface StandaloneCardItem {
  card: Card;
  accentColor?: string;
}
