import { useState } from "react";

export function useTableEditing() {
  const [editingIds, setEditingIds] = useState<number[]>([]);
  const [activeTempId, setActiveTempId] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string[]>
  >({});

  const clearValidationError = (tempId: number, field: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[tempId]) {
        newErrors[tempId] = newErrors[tempId].filter((f) => f !== field);
        if (newErrors[tempId].length === 0) {
          delete newErrors[tempId];
        }
      }
      return newErrors;
    });
  };

  return {
    editingIds,
    setEditingIds,
    activeTempId,
    setActiveTempId,
    validationErrors,
    setValidationErrors,
    clearValidationError,
  };
}
