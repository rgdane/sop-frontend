import React from "react";
import { DragDrop } from "@/components/ui/DragDrop/DragDrop";

export type DragMode = "reorder" | "hierarchy";
export type DropZone = "above" | "below" | "inside" | null;

export interface DragDropState {
  isDragging: boolean;
  dragMode: DragMode | null;
  sourceIndex: number | null;
  targetIndex: number | null;
  dropZone: DropZone;
  dragOverElement: Element | null;
}

export interface DragDropResult<T> {
  sourceItem: T;
  targetItem: T;
  dropZone: DropZone;
  mode: DragMode;
  success: boolean;
  error?: string;
}

export interface DragDropOptions<T> {
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
  onReorder?: (sourceIndex: number, targetIndex: number) => Promise<void>;
  onHierarchyChange?: (
    itemId: string | number,
    newParentId: string | number | null,
    targetIndex: number
  ) => Promise<void>;
  onDragStart?: (item: T, index: number, mode: DragMode) => void;
  onDragEnd?: (result: DragDropResult<T>) => void;
}

export interface DragDropHandlers<T> {
  handleDragStart: (
    e: React.DragEvent,
    item: T,
    index: number,
    mode: DragMode
  ) => void;
  handleDragOver: (e: React.DragEvent, item: T, index: number) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, item: T, index: number) => Promise<void>;
  handleDragEnd: (e: React.DragEvent) => void;
}

export interface UseDragDropReturn<T> {
  dragDropState: DragDropState;
  dragDropHandlers: DragDropHandlers<T>;
  getDragDropProps: (
    item: T,
    index: number
  ) => {
    className: string;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
  renderDragHandles: (item: T, index: number) => React.ReactNode;
}

export function useDragDrop<T>({
  items,
  enabled = true,
  modes = { reorder: true, hierarchy: false },
  visual = {
    showHandles: true,
    dropZones: {
      above: "border-t-4 border-t-blue-500",
      below: "border-b-4 border-b-blue-500",
      inside: "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400",
    },
    dragging: {
      source: "",
      target: "bg-gray-50 dark:bg-gray-900/20",
    },
  },
  onReorder,
  onHierarchyChange,
  onDragStart,
  onDragEnd,
}: DragDropOptions<T>): UseDragDropReturn<T> {
  const [dragDropState, setDragDropState] = React.useState<DragDropState>({
    isDragging: false,
    dragMode: null,
    sourceIndex: null,
    targetIndex: null,
    dropZone: null,
    dragOverElement: null,
  });

  // Use refs to store latest values to avoid stale closures
  const dragDropStateRef = React.useRef(dragDropState);
  const itemsRef = React.useRef(items);

  React.useEffect(() => {
    dragDropStateRef.current = dragDropState;
  }, [dragDropState]);

  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const getDropZone = React.useCallback(
    (event: React.DragEvent, bounds: DOMRect): DropZone => {
      if (!modes.hierarchy) return "above";

      const y = event.clientY - bounds.top;
      const height = bounds.height;

      if (y < height * 0.25) return "above";
      if (y > height * 0.75) return "below";
      return "inside";
    },
    [modes.hierarchy]
  );

  const handleDragStart = React.useCallback(
    (e: React.DragEvent, item: T, index: number, mode: DragMode) => {
      if (!enabled) return;

      const dragData = {
        index,
        item: JSON.stringify(item),
        mode,
      };

      e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
      e.dataTransfer.effectAllowed = "move";

      // Custom drag image: hanya icon, warna sesuai mode
      if (e.currentTarget instanceof HTMLElement) {
        const iconNode =
          e.currentTarget.querySelector("svg") || e.currentTarget;
        if (iconNode) {
          const dragIcon = iconNode.cloneNode(true) as HTMLElement;
          dragIcon.style.background = "transparent";
          dragIcon.style.boxShadow = "none";
          dragIcon.style.padding = "0";
          dragIcon.style.margin = "0";
          dragIcon.style.display = "block";
          // Set warna sesuai mode
          if (mode === "reorder") {
            dragIcon.style.color = "#3b82f6"; // Tailwind blue-500
            dragIcon.style.fill = "#3b82f6";
          } else if (mode === "hierarchy") {
            dragIcon.style.color = "#3b82f6"; // Tailwind blue-500
            dragIcon.style.fill = "#3b82f6";
          }
          // Buat node di luar layar
          const wrapper = document.createElement("div");
          wrapper.style.position = "absolute";
          wrapper.style.top = "-1000px";
          wrapper.style.left = "-1000px";
          wrapper.appendChild(dragIcon);
          document.body.appendChild(wrapper);
          // Gunakan ukuran asli icon
          e.dataTransfer.setDragImage(
            dragIcon,
            dragIcon.offsetWidth / 2 || 12,
            dragIcon.offsetHeight / 2 || 12
          );
          setTimeout(() => document.body.removeChild(wrapper), 0);
        }
      }

      setDragDropState((prev) => ({
        ...prev,
        isDragging: true,
        dragMode: mode,
        sourceIndex: index,
      }));

      onDragStart?.(item, index, mode);
    },
    [enabled, onDragStart]
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent, item: T, index: number) => {
      if (!enabled) return;

      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      setDragDropState((prev) => {
        // Only proceed if we're actually dragging
        if (!prev.isDragging) return prev;

        // Check if currentTarget exists before calling getBoundingClientRect
        const currentTarget = e.currentTarget as HTMLElement;
        if (!currentTarget) return prev;

        const bounds = currentTarget.getBoundingClientRect();
        const dropZone = getDropZone(e, bounds);

        // Only update if values actually changed to prevent unnecessary re-renders
        if (
          prev.targetIndex === index &&
          prev.dropZone === dropZone &&
          prev.dragOverElement === currentTarget
        ) {
          return prev;
        }

        return {
          ...prev,
          targetIndex: index,
          dropZone,
          dragOverElement: currentTarget as Element,
        };
      });
    },
    [enabled, getDropZone]
  );

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent) => {
      if (!enabled) return;

      const currentTarget = e.currentTarget;
      const relatedTarget = e.relatedTarget as Node;

      if (!currentTarget || !currentTarget.contains(relatedTarget)) {
        setDragDropState((prev) => ({
          ...prev,
          targetIndex: null,
          dropZone: null,
          dragOverElement: null,
        }));
      }
    },
    [enabled]
  );

  const handleDrop = React.useCallback(
    async (e: React.DragEvent, targetItem: T, targetIndex: number) => {
      if (!enabled) return;

      e.preventDefault();

      try {
        const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
        const { index: sourceIndex, mode } = dragData;

        if (sourceIndex === targetIndex) return;

        let success = false;
        let error: string | undefined;

        if (mode === "reorder" && onReorder) {
          await onReorder(sourceIndex, targetIndex);
          success = true;
        } else if (mode === "hierarchy" && onHierarchyChange) {
          // Extract item ID for hierarchy change
          const sourceItem = itemsRef.current[sourceIndex];
          const itemId = (sourceItem as any).id;

          // Determine new parent and index based on drop zone
          let newParentId: string | number | null = null;
          let newIndex = 0;

          if (dragDropStateRef.current.dropZone === "inside") {
            // Dropped inside target item - target becomes parent
            newParentId = (targetItem as any).id;
            // Add as last child - count existing children
            const childrenCount = itemsRef.current.filter(
              (item) => (item as any).parent_id === newParentId
            ).length;
            newIndex = childrenCount + 1; // 1-based indexing
          } else {
            // Dropped above or below target item - same parent as target
            newParentId = (targetItem as any).parent_id || null;

            // Get all siblings in the new parent (excluding source item)
            const sourceId = (sourceItem as any).id;
            const siblings = itemsRef.current.filter((item) => {
              const itemParentId = (item as any).parent_id || null;
              const itemId = (item as any).id;
              return itemParentId === newParentId && itemId !== sourceId;
            });

            // Sort siblings by index
            siblings.sort((a, b) => (a as any).index - (b as any).index);

            // Find target position in siblings
            const targetSiblingIndex = siblings.findIndex(
              (sibling) => (sibling as any).id === (targetItem as any).id
            );

            if (dragDropStateRef.current.dropZone === "above") {
              // Insert before target
              newIndex = targetSiblingIndex >= 0 ? targetSiblingIndex + 1 : 1;
            } else {
              // Insert after target
              newIndex =
                targetSiblingIndex >= 0
                  ? targetSiblingIndex + 2
                  : siblings.length + 1;
            }
          }

          await onHierarchyChange(itemId, newParentId, newIndex);
          success = true;
        }

        onDragEnd?.({
          sourceItem: itemsRef.current[sourceIndex],
          targetItem,
          dropZone: dragDropStateRef.current.dropZone,
          mode,
          success,
          error,
        });
      } catch (error) {
        console.error("Drop error:", error);
      } finally {
        setDragDropState({
          isDragging: false,
          dragMode: null,
          sourceIndex: null,
          targetIndex: null,
          dropZone: null,
          dragOverElement: null,
        });
      }
    },
    [enabled, onReorder, onHierarchyChange, onDragEnd]
  );

  const handleDragEnd = React.useCallback((e: React.DragEvent) => {
    // Do not reset opacity

    setDragDropState({
      isDragging: false,
      dragMode: null,
      sourceIndex: null,
      targetIndex: null,
      dropZone: null,
      dragOverElement: null,
    });
  }, []);

  const getDragDropProps = React.useCallback(
    (item: T, index: number) => {
      let className = "transition-all duration-200";
      let style: React.CSSProperties = {};

      // Do not add opacity-50 or faded class to drag source

      if (dragDropState.targetIndex === index && dragDropState.dropZone) {
        const dropZones = visual.dropZones || {};
        const dropZoneClass =
          dropZones[dragDropState.dropZone] ||
          (dragDropState.dropZone === "above"
            ? "border-t-4 border-t-blue-500"
            : dragDropState.dropZone === "below"
              ? "border-b-4 border-b-blue-500"
              : "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400");
        className += ` ${dropZoneClass}`;

        // Add target row background styling - blue for light mode, gray for dark mode
        className += " bg-blue-100 dark:bg-gray-600";
      }

      return {
        className,
        style,
        onDragOver: (e: React.DragEvent) => handleDragOver(e, item, index),
        onDragLeave: handleDragLeave,
        onDrop: (e: React.DragEvent) => handleDrop(e, item, index),
        onDragEnd: handleDragEnd,
      };
    },
    [
      dragDropState,
      visual,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
    ]
  );

  const renderDragHandles = React.useCallback(
    (item: T, index: number) => {
      if (!enabled || !visual.showHandles) return null;

      const handles: React.ReactElement[] = [];

      // Cek jika item punya properti is_default true (khusus Status)
      const isDefault = (item as any)?.is_default === true;

      if (modes.reorder) {
        handles.push(
          <DragDrop
            key="reorder"
            dragKey="reorder"
            draggable={!isDefault}
            onDragStart={
              isDefault
                ? undefined
                : (e: any) => handleDragStart(e, item, index, "reorder")
            }
            className={
              isDefault
                ? "text-blue-300 cursor-default opacity-50"
                : "text-blue-500 hover:text-blue-700 cursor-grab active:cursor-grabbing"
            }
            title={
              isDefault
                ? "Status default tidak bisa di-drag"
                : "Drag to reorder"
            }
            visual={visual}
          />
        );
      }

      if (modes.hierarchy) {
        handles.push(
          <DragDrop
            key="hierarchy"
            dragKey="hierarchy"
            draggable={!isDefault}
            onDragStart={
              isDefault
                ? undefined
                : (e: any) => handleDragStart(e, item, index, "hierarchy")
            }
            className={
              isDefault
                ? "text-blue-300 cursor-default opacity-50"
                : "text-blue-500 hover:text-blue-700 cursor-grab active:cursor-grabbing"
            }
            title={
              isDefault
                ? "Status default tidak bisa di-drag"
                : "Drag to change hierarchy"
            }
          />
        );
      }

      return <span className="flex gap-1">{handles}</span>;
    },
    [enabled, visual, modes, handleDragStart]
  );

  return {
    dragDropState,
    dragDropHandlers: {
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
    },
    getDragDropProps,
    renderDragHandles,
  };
}
