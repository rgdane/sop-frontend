// import {
//   BaseRecord,
//   EditableRecord,
//   TableColumn,
// } from "@/types/props/table.types";

// export function parseClipboard(text: string) {
//   return text
//     .trim()
//     .split("\n")
//     .map((line) => line.split("\t"));
// }

// export function createPasteHandler<T extends BaseRecord>(
//   columns: TableColumn<T>[],
//   setDataSource: React.Dispatch<
//     React.SetStateAction<Array<EditableRecord & T>>
//   >,
//   tempCounter: number,
//   setTempCounter: React.Dispatch<React.SetStateAction<number>>,
//   editingIds: number[],
//   setEditingIds: React.Dispatch<React.SetStateAction<number[]>>,
//   activeTempId: number | null
// ) {
//   return async (e: React.ClipboardEvent<HTMLDivElement>) => {
//     const editableColumns = columns.filter(
//       (col) => col.editable && col.key !== "dragHandle"
//     );
//     if (editableColumns.length === 0) return;

//     const clipboardData = e.clipboardData.getData("Text");
//     const rows = parseClipboard(clipboardData);

//     setDataSource((prev) => {
//       const updated = [...prev];
//       let maxId = tempCounter;

//       const editableEmptyRows = updated.filter((r) => {
//         if (!r.isNew) return false;
//         const keys = Object.keys(r).filter(
//           (k) => !["id", "tempId", "isNew"].includes(k)
//         );
//         return keys.every((key) => {
//           const value = (r as any)[key];
//           return value === null || value === undefined || value === "";
//         });
//       });

//       const newRows: Array<EditableRecord & T> = [];
//       const newEditingIds = [...editingIds];

//       rows.forEach((cols, idx) => {
//         let targetRow: EditableRecord & T;

//         if (editableEmptyRows[idx]) {
//           targetRow = editableEmptyRows[idx];
//         } else {
//           targetRow = {
//             id: 0,
//             tempId: maxId++,
//             isNew: true,
//           } as EditableRecord & T;
//           newRows.push(targetRow);
//           newEditingIds.push(targetRow.tempId);
//         }

//         editableColumns.forEach((col, colIndex) => {
//           const key = col.key as keyof T;
//           const inputValue = cols[colIndex]?.trim();

//           if (col.inputType === "select" && Array.isArray(col.options)) {
//             const match = col.options.find(
//               (opt) =>
//                 opt.label?.toLowerCase?.() === inputValue?.toLowerCase?.()
//             );
//             (targetRow as any)[key] = match ? match.value : null;
//           } else if (
//             col.inputType === "multiSelect" &&
//             Array.isArray(col.options)
//           ) {
//             const names = (inputValue ?? "").split(",").map((n) => n.trim());
//             const matched = col.options.filter((opt: any) =>
//               names.some((n) => opt.label?.toLowerCase?.() === n.toLowerCase())
//             );
//             (targetRow as any)[key] =
//               matched.length > 0 ? matched.map((m: any) => m.value) : [];
//           } else if (col.inputType === "date") {
//             const parsedDate = new Date(inputValue);
//             (targetRow as any)[key] = isNaN(parsedDate.getTime())
//               ? null
//               : parsedDate;
//           } else {
//             (targetRow as any)[key] = inputValue;
//           }
//         });

//         if (!newEditingIds.includes(targetRow.tempId)) {
//           newEditingIds.push(targetRow.tempId);
//         }
//       });

//       let insertIndex = updated.length;
//       if (activeTempId !== null) {
//         const idx = updated.findIndex((r) => r.tempId === activeTempId);
//         if (idx !== -1) insertIndex = idx + 1;
//       }

//       updated.splice(insertIndex, 0, ...newRows);
//       setTempCounter(maxId);
//       setEditingIds([...new Set(newEditingIds)]);
//       return updated;
//     });

//     e.preventDefault();
//   };
// }
