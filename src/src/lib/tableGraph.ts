type CellAction =
  | { type: "create"; elementId: string; value: any; rowIndex: number }
  | { type: "update"; elementId: string; value: any }
  | { type: "skip" };

export const resolveCellAction = ({
  rowId,
  elementId,
  value,
  prevValue,
  rowIndex,
  isNewRow,
  columns
}: {
  rowId: string;
  elementId: string;
  value: any;
  prevValue: any;
  rowIndex: number;
  isNewRow: boolean;
  columns: any[];
}): CellAction => {
  // Row baru → selalu CREATE
  if (isNewRow) {
    return {
      type: "create",
      elementId,
      value,
      rowIndex
    };
  }

  // Row lama → cek cell exist
  const exists = hasExistingCell(columns, elementId, rowIndex);

  // Cell belum ada → CREATE
  if (!exists) {
    if (value === undefined || value === "") {
      return { type: "skip" };
    }

    return {
      type: "create",
      elementId,
      value,
      rowIndex
    };
  }

  //    Cell sudah ada → cek perubahan
  if ((prevValue ?? "") !== (value ?? "")) {
    return {
      type: "update",
      elementId,
      value
    };
  }

  return { type: "skip" };
};


export const hasExistingCell = (
  columns: any[],
  elementId: string,
  rowIndex: number
): boolean => {
  return columns.some(col =>
    col.key === elementId &&
    col.has_row?.some((r: any) => r.row_index === rowIndex)
  );
};
