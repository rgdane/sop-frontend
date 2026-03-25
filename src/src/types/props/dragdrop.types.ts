import React from 'react';

export interface DragDropConfig<T = any> {
  /** Enable/disable drag and drop */
  enabled: boolean;
  
  /** Drag and drop modes */
  modes: {
    /** Allow reordering within same level */
    reorder: boolean;
    /** Allow hierarchy changes (parent-child relationships) */
    hierarchy: boolean;
  };
  
  /** Visual configuration */
  visual: {
    /** Show drag handles */
    showHandles: boolean;
    /** Custom drag handle icons */
    handles?: {
      reorder?: React.ReactNode;
      hierarchy?: React.ReactNode;
    };
    /** Drop zone indicators */
    dropZones: {
      above: string; // CSS classes
      below: string;
      inside: string;
    };
    /** Dragging state styles */
    dragging: {
      source: string; // CSS classes for item being dragged
      target: string; // CSS classes for drop target
    };
  };
  
  /** Behavior configuration */
  behavior: {
    /** Auto-expand parent nodes when dropping inside */
    autoExpand: boolean;
    /** Validate drop operations */
    validateDrop?: (sourceItem: T, targetItem: T, dropZone: DropZone) => boolean;
    /** Custom drop zone detection */
    getDropZone?: (event: React.DragEvent, bounds: DOMRect) => DropZone;
  };
  
  /** Event handlers */
  onDragStart?: (item: T, index: number, mode: DragMode) => void;
  onDragEnd?: (result: DragDropResult<T>) => void;
  onReorder?: (items: T[], sourceIndex: number, targetIndex: number) => Promise<void>;
  onHierarchyChange?: (
    item: T, 
    newParent: T | null, 
    targetIndex: number
  ) => Promise<void>;
}

export type DragMode = 'reorder' | 'hierarchy';
export type DropZone = 'above' | 'below' | 'inside' | null;

export interface DragDropResult<T> {
  sourceItem: T;
  targetItem: T;
  dropZone: DropZone;
  mode: DragMode;
  success: boolean;
  error?: string;
}

export interface DragDropState {
  isDragging: boolean;
  dragMode: DragMode | null;
  sourceIndex: number | null;
  targetIndex: number | null;
  dropZone: DropZone;
  dragOverElement: Element | null;
}

export interface TreeNode<T = any> {
  id: string | number;
  parent_id?: string | number | null;
  index: number;
  level?: number;
  hasChildren?: boolean;
  isExpanded?: boolean;
  childrenCount?: number;
  path?: (string | number)[];
  data: T;
}

export interface HierarchyHelpers<T> {
  /** Get parent ID from item */
  getParentId: (item: T) => string | number | null;
  /** Get item ID */
  getId: (item: T) => string | number;
  /** Get item index/order */
  getIndex: (item: T) => number;
  /** Set parent ID */
  setParentId: (item: T, parentId: string | number | null) => T;
  /** Set index */
  setIndex: (item: T, index: number) => T;
  /** Validate if parentId can be parent of childId */
  validateParentChild?: (items: T[], childId: string | number, parentId: string | number | null) => boolean;
  /** Get children of a parent */
  getChildren: (items: T[], parentId: string | number | null) => T[];
  /** Build tree structure */
  buildTree?: (items: T[]) => TreeNode<T>[];
}
