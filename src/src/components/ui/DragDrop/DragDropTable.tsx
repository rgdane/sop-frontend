import React from "react";
import { useDragDrop } from "@/hooks/useDragDrop";
import HolderOutlined from "@ant-design/icons/lib/icons/HolderOutlined";

// Re-export types for convenience
export type DragMode = "reorder" | "hierarchy";

export interface DragDropTableColumnProps {
  key: string;
  title?: React.ReactNode;
  width?: number;
  renderDragHandles: (item: any, index: number) => React.ReactNode;
}

export interface DragDropTableProps<T> {
  items: T[];
  enabled?: boolean;
  modes?: {
    reorder?: boolean;
    hierarchy?: boolean;
  };
  visual?: {
    showHandles?: boolean;
    dropZones?: {
      above?: string;
      below?: string;
      inside?: string;
    };
    dragging?: {
      source?: string;
      target?: string;
    };
    handles?: {
      reorder?: React.ReactNode;
      hierarchy?: React.ReactNode;
    };
  };
  /** Whether to show a dedicated drag handle column */
  showDragColumn?: boolean;
  /** Custom drag column configuration */
  dragColumn?: Partial<DragDropTableColumnProps>;
  onReorder?: (sourceIndex: number, targetIndex: number) => Promise<void>;
  onHierarchyChange?: (
    itemId: string | number,
    newParentId: string | number | null,
    targetIndex: number
  ) => Promise<void>;
  /** Called when drag starts - for custom logging/analytics */
  onDragStart?: (item: T, index: number, mode: DragMode) => void;
  /** Called when drag ends - for custom logging/analytics */
  onDragEnd?: (success: boolean, error?: string) => void;
}

/**
 * Enhanced useDragDrop hook specifically designed for table integration
 * Provides additional utilities for table-based drag and drop operations
 */
export function useDragDropTable<T>({
  items,
  enabled = true,
  modes = { reorder: true, hierarchy: false },
  visual,
  showDragColumn = true,
  dragColumn,
  onReorder,
  onHierarchyChange,
  onDragStart,
  onDragEnd,
}: DragDropTableProps<T>) {
  const dragDrop = useDragDrop({
    items,
    enabled,
    modes: {
      reorder: modes?.reorder ?? true,
      hierarchy: modes?.hierarchy ?? false,
    },
    visual: visual
      ? {
          showHandles: visual.showHandles ?? true,
          dropZones: {
            above: visual.dropZones?.above ?? "border-t-4 border-t-blue-500",
            below: visual.dropZones?.below ?? "border-b-4 border-b-blue-500",
            inside:
              visual.dropZones?.inside ??
              "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400",
          },
          dragging: {
            source: visual.dragging?.source ?? "opacity-50",
            target: visual.dragging?.target ?? "bg-gray-50 dark:bg-gray-900/20",
          },
          handles: visual.handles,
        }
      : undefined,
    onReorder,
    onHierarchyChange,
    onDragStart,
    onDragEnd: (result) => {
      onDragEnd?.(result.success, result.error);
    },
  });

  // Create drag column configuration for TableBuilder
  const getDragColumn =
    React.useCallback((): DragDropTableColumnProps | null => {
      if (!enabled || !showDragColumn) return null;

      return {
        key: "dragHandle",
        title: dragColumn?.title || "",
        width: dragColumn?.width || 70,
        renderDragHandles: dragDrop.renderDragHandles,
        ...dragColumn,
      };
    }, [enabled, showDragColumn, dragColumn, dragDrop.renderDragHandles]);

  // Enhanced row props for TableBuilder integration
  const getRowProps = React.useCallback(
    (record: T, index: number) => {
      const dragDropProps = dragDrop.getDragDropProps(record, index);

      return {
        ...dragDropProps,
        style: {
          userSelect: "none" as const,
          // Add any custom styling based on record properties
        },
      };
    },
    [dragDrop]
  );

  return {
    ...dragDrop,
    getDragColumn,
    getRowProps,
    // Convenience methods
    isEnabled: enabled,
    isDragging: dragDrop.dragDropState.isDragging,
    canReorder: modes.reorder,
    canChangeHierarchy: modes.hierarchy,
  };
}

/**
 * Default drag column configuration for common use cases
 */
export const DEFAULT_DRAG_COLUMN_CONFIGS = {
  reorderOnly: {
    modes: { reorder: true, hierarchy: false },
    visual: {
      showHandles: true,
      handles: {
        reorder: <HolderOutlined />,
      },
      dropZones: {
        above: "border-t-4 border-t-blue-500",
        below: "border-b-4 border-b-blue-500",
      },
    },
  },
  hierarchyOnly: {
    modes: { reorder: false, hierarchy: true },
    visual: {
      showHandles: true,
      handles: {
        hierarchy: <HolderOutlined />,
      },
      dropZones: {
        above: "border-t-4 border-t-blue-500",
        below: "border-b-4 border-b-blue-500",
        inside: "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400",
      },
    },
  },
  full: {
    modes: { reorder: true, hierarchy: true },
    visual: {
      showHandles: true,
      dropZones: {
        above: "border-t-4 border-t-blue-500",
        below: "border-b-4 border-b-blue-500",
        inside: "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400",
      },
    },
  },
} as const;

/**
 * Utility function to create drag column configuration for TableBuilder
 */
export function createDragColumn<T>(
  renderDragHandles: (item: T, index: number) => React.ReactNode,
  options?: Partial<DragDropTableColumnProps>
): DragDropTableColumnProps {
  return {
    key: "dragHandle",
    title: "",
    width: 70,
    renderDragHandles: renderDragHandles as any,
    ...options,
  };
}