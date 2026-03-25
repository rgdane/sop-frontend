import React from "react";
import { useDragDropTable, DEFAULT_DRAG_COLUMN_CONFIGS } from "@/components/ui/DragDrop/DragDropTable";
import { SopJob } from "@/types/data/sop_job.types";

export interface UseSopJobDragDropOptions {
  sopJobs: SopJob[];
  sopId: number;
  onReorder: ( sopJobId: number, newIndex: number, sopId: number) => Promise<void>;
}

export interface UseSopJobDragDropReturn {
  dragDropTable: ReturnType<typeof useDragDropTable<SopJob>>;
  handleReorderDrop: (sourceIndex: number, targetIndex: number) => Promise<void>;
}

/**
 * Custom hook fors sop-job drag & drop functionality with single API call
 * Implements the backend specification froms sop-job-drag-drop-reorder-implementation.md
 */
export function useSopJobDragDrop({
  sopJobs,
  sopId,
  onReorder,
}: UseSopJobDragDropOptions): UseSopJobDragDropReturn {
  
  // Create drag & drop table configuration (reorder only)
  const dragDropTable = useDragDropTable<SopJob>({
    items: sopJobs,
    enabled: true,
    ...DEFAULT_DRAG_COLUMN_CONFIGS.reorderOnly,
    showDragColumn: true,
    onReorder: async (sourceIndex: number, targetIndex: number) => {
      await handleReorderDrop(sourceIndex, targetIndex);
    },
  });

  // Handle reorder drop with single API call (backend handles all adjustments)
  const handleReorderDrop = React.useCallback(async (sourceIndex: number, targetIndex: number) => {
    try {
      const sourceSopJob = sopJobs[sourceIndex];
      
      // If same position, no need to do anything
      if (sourceIndex === targetIndex) {
        return;
      }
      
      // Convert 0-based index to 1-based index for backend
      const newIndex = targetIndex + 1;
      
      // Single API call - backend handles all index adjustments automatically
      await onReorder(sourceSopJob.id, newIndex, sopId);
      
    } catch (error) {
      console.error('Reorder error:', error);
      throw error;
    }
  }, [sopJobs, sopId, onReorder]);

  return {
    dragDropTable,
    handleReorderDrop,
  };
}
