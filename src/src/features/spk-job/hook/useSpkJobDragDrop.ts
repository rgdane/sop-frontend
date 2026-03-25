import React from "react";
import {
  useDragDropTable,
  DEFAULT_DRAG_COLUMN_CONFIGS,
} from "@/components/ui/DragDrop/DragDropTable";
import { SpkJob } from "@/types/data/spk_job.types";

export interface UseSpkJobDragDropOptions {
  spkJobs: SpkJob[];
  spkId: number;
  onReorder: (
    spkJobId: number,
    newIndex: number,
    spkId: number
  ) => Promise<void>;
}

export interface UseSpkJobDragDropReturn {
  dragDropTable: ReturnType<typeof useDragDropTable<SpkJob>>;
  handleReorderDrop: (
    sourceIndex: number,
    targetIndex: number
  ) => Promise<void>;
}

/**
 * Custom hook for spk-job drag & drop functionality with single API call
 * Implements the backend specification from spk-job-drag-drop-reorder-implementation.md
 */
export function useSpkJobDragDrop({
  spkJobs,
  spkId,
  onReorder,
}: UseSpkJobDragDropOptions): UseSpkJobDragDropReturn {
  // Handle reorder drop with single API call (backend handles all adjustments)
  const handleReorderDrop = React.useCallback(
    async (sourceIndex: number, targetIndex: number) => {
      try {
        // 🔧 FIX: Validasi index
        if (
          sourceIndex < 0 ||
          targetIndex < 0 ||
          sourceIndex >= spkJobs.length ||
          targetIndex >= spkJobs.length
        ) {
          console.error("❌ Invalid index:", {
            sourceIndex,
            targetIndex,
            length: spkJobs.length,
          });
          return;
        }

        // If same position, no need to do anything
        if (sourceIndex === targetIndex) {
          return;
        }

        const sourceSpkJob = spkJobs[sourceIndex];

        if (!sourceSpkJob) {
          console.error("❌ Source SpkJob not found at index:", sourceIndex);
          return;
        }

        // 🔧 FIX: Convert to 1-based index untuk backend
        const newBackendIndex = targetIndex + 1;

        // Single API call - backend handles all index adjustments automatically
        await onReorder(sourceSpkJob.id, newBackendIndex, spkId);
      } catch (error) {
        console.error("❌ Reorder error:", error);
        throw error;
      }
    },
    [spkJobs, spkId, onReorder]
  );

  // Create drag & drop table configuration (reorder only)
  const dragDropTable = useDragDropTable<SpkJob>({
    items: spkJobs,
    enabled: true,
    ...DEFAULT_DRAG_COLUMN_CONFIGS.reorderOnly,
    showDragColumn: true,
    onReorder: handleReorderDrop,
  });

  return {
    dragDropTable,
    handleReorderDrop,
  };
}
