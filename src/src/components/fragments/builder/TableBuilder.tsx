"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useContext,
} from "react";
import { Button, Table } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HolderOutlined } from "@ant-design/icons";
import {
  BaseRecord,
  EditableRecord,
  TableBuilderProps,
} from "@/types/props/table.types";
import { TableCell } from "@/components/ui/Table/TableCell";
import { TableActions } from "@/components/ui/Table/TableAction";
import { HeaderAction } from "@/components/ui/Table/HeaderAction";
import { BulkActionBar } from "@/components/ui/Table/BulkActionBar";
import { FooterAction } from "@/components/ui/Table/FooterAction";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTableActions } from "@/features/table/hook/useTableAction";
import { useTableSelection } from "@/features/table/hook/useTableSelection";
import { useTableEditing } from "@/features/table/hook/useTableEditing";
import { useTableData } from "@/features/table/hook/useTableData";
import ColumnSearch from "@/components/ui/Table/ColumnSearch";

dayjs.extend(customParseFormat);

const DEFAULT_COLUMN_WIDTH = 160;
const TABLE_SCROLL_HEIGHT = 550;
const SPECIAL_COLUMNS = ["name", "code"] as const;
const NON_DATA_KEYS = ["id", "tempId", "isNew"] as const;

// Types
type ValidationErrors = Record<number, string[]>;
type ColumnWithRenderFlag<T> = T & { renderDataView?: boolean };

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

const TableRowContext = React.createContext<RowContextProps>({});

export const TableRowDragHandle = () => {
  const { setActivatorNodeRef, listeners } = useContext(TableRowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: "move" }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

interface DragRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string | number;
}

const DragRow = (props: DragRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props["data-row-key"] });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners]
  );

  return (
    <TableRowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </TableRowContext.Provider>
  );
};

// Utility functions
const createDefaultRecord = <T extends BaseRecord>(
  tempId: number,
  defaultValues?: Partial<T>
): EditableRecord & T =>
({
  id: 0,
  isNew: true,
  tempId,
  ...defaultValues,
} as EditableRecord & T);

const scrollToElement = (
  container: HTMLDivElement,
  selector: string,
  behavior: ScrollBehavior = "smooth"
) => {
  const element = container.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior, block: "nearest" });
  }
};

const focusElement = (container: HTMLDivElement, selector: string) => {
  const element = container.querySelector(selector) as HTMLElement;
  if (element) {
    element.focus();
  }
};

export function TableBuilder<T extends BaseRecord>({
  datas,
  title = "",
  description,
  columns,
  filterDeleted,
  onChange,
  onRestore,
  onCreate = async () => { },
  onUpdate = async () => { },
  onDelete = async () => { },
  onBulkCreate,
  onBulkUpdate,
  onBulkDelete,
  onDrawer = { open: () => { }, close: () => { } },
  onFieldChange,
  onActions,
  onGenerator,
  loading = false,
  useModal = true,
  useGenerator = false,
  useDrawer = false,
  useEdit = true,
  useDelete = true,
  useBulkAction = true,
  useHeaderAction = true,
  useFooterAction = true,
  addButtonText = "Tambah",
  addGeneratorText = "Generate",
  deleteConfirmTitle = "Hapus Data?",
  defaultValues,
  hideActions,
  redirectPage = null,
  rowProps,
  redirectModule = "",
  onPaginate,
  autoSave = false,
  rowClickUpdate = false,
  useColumnAction = true,
  useTrashFilter = false,
  customModal,
  onImport,
  onDrag,
  onDragEnd,
}: TableBuilderProps<T>) {
  const [isFilterDeleted, setIsFilterDeleted] = useState(false);
  const [draggingRowIndex, setDraggingRowIndex] = useState<number | null>(null);
  const [columnWidth] = useState(DEFAULT_COLUMN_WIDTH);
  const [activeColumnKey, setActiveColumnKey] = useState<string | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const { handleRowSave, handleDelete, handleBulkCreateNewRows } =
    useTableActions(columns, onCreate, onUpdate, onDelete, onBulkCreate);

  const { dataSource, setDataSource, tempCounter, setTempCounter } =
    useTableData(datas, title);

  const {
    selectedRowKeys,
    setSelectedRowKeys,
    rowSelection,
    getSelectedRecords,
  } = useTableSelection(dataSource, hideActions);

  const {
    editingIds,
    setEditingIds,
    activeTempId,
    setActiveTempId,
    validationErrors,
    setValidationErrors,
  } = useTableEditing();

  useEffect(() => {
    const mappedData = datas.map((item, index) => ({
      ...item,
      tempId: item.id || index + 1,
    }));
    setDataSource(mappedData);
    setTempCounter(Math.max(...datas.map((d) => d.id || 0), 0) + 1);
  }, [datas, setDataSource, setTempCounter]);

  // Memoized values
  const normalizedColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        renderDataView: col.renderDataView ?? true,
      })),
    [columns]
  );

  // Validation logic
  const validateRecord = useCallback(
    (record: EditableRecord & T): string[] => {
      const errors: string[] = [];
      columns.forEach((col) => {
        const rules = col.rules || [];
        const value = record[col.key as keyof T];
        const requiredRule = rules.find((r: any) => r.required);

        if (
          requiredRule &&
          (value === "" || value === undefined || value === null)
        ) {
          errors.push(col.key);
        }
      });
      return errors;
    },
    [columns]
  );

  const validateRecords = useCallback(
    (records: (EditableRecord & T)[]): ValidationErrors => {
      const newValidationErrors: ValidationErrors = {};

      records.forEach((record) => {
        const errors = validateRecord(record);
        if (errors.length > 0) {
          newValidationErrors[record.tempId] = errors;
        }
      });

      return newValidationErrors;
    },
    [validateRecord]
  );

  // Event handlers
  const handleRowClick = useCallback(
    (record: EditableRecord & T) => {
      if (rowClickUpdate && !editingIds.includes(record.tempId)) {
        setEditingIds((prev) => [...prev, record.tempId]);
      }
    },
    [rowClickUpdate, editingIds, setEditingIds]
  );

  const handleInputChange = useCallback(
    (tempId: number, field: keyof T, value: any) => {
      setDataSource((prev) =>
        prev.map((row) =>
          row.tempId === tempId ? { ...row, [field]: value } : row
        )
      );

      if (autoSave) {
        setEditingIds((prev) =>
          prev.includes(tempId) ? prev : [...prev, tempId]
        );
      }

      // Clear validation errors for this field
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

      // Call field change callback
      if (onFieldChange) {
        const record = dataSource.find((row) => row.tempId === tempId);
        if (record) {
          onFieldChange(tempId, field, value, record);
        }
      }
    },
    [
      setDataSource,
      autoSave,
      setEditingIds,
      setValidationErrors,
      onFieldChange,
      dataSource,
    ]
  );

  const handleAddRow = useCallback(() => {
    const newTempId = tempCounter;
    const newRecord = createDefaultRecord(newTempId, defaultValues);

    setDataSource((prev: any) => [...prev, newRecord]);
    setActiveTempId(newTempId);
    setTempCounter((prev) => prev + 1);
    setEditingIds((prev) => [...prev, newTempId]);

    setTimeout(() => {
      if (tableContainerRef.current) {
        const tableBody =
          tableContainerRef.current.querySelector(".ant-table-tbody");
        if (tableBody) {
          tableBody.scrollTop = tableBody.scrollHeight;
        }

        scrollToElement(
          tableContainerRef.current,
          ".ant-table-tbody tr:last-child"
        );
        focusElement(
          tableContainerRef.current,
          ".ant-table-tbody tr:last-child input, .ant-table-tbody tr:last-child .ant-select-selector"
        );
      }
    }, 100);
  }, [
    tempCounter,
    defaultValues,
    setDataSource,
    setActiveTempId,
    setTempCounter,
    setEditingIds,
  ]);

  const handleSaveRecords = useCallback(
    async (
      recordsToSave: (EditableRecord & T)[],
      updatedRecord?: EditableRecord & T
    ): Promise<boolean> => {
      if (recordsToSave.length === 0) return true;

      const validationErrors = validateRecords(recordsToSave);

      if (Object.keys(validationErrors).length > 0) {
        setValidationErrors(validationErrors);
        return false;
      }

      setValidationErrors({});

      const results = await Promise.all(
        recordsToSave.map((record) => handleRowSave(record, true))
      );

      return results.every((result) => result);
    },
    [validateRecords, setValidationErrors, handleRowSave]
  );

  const handleCellSave = useCallback(
    async (record: EditableRecord & T, updatedRecord?: EditableRecord & T) => {
      const allNewRecords = dataSource.filter((d) => d.isNew);

      if (allNewRecords.length > 0) {
        await handleBulkCreateNewRows(
          dataSource,
          setEditingIds,
          setDataSource,
          setValidationErrors
        );
        return;
      }

      const recordsToSave =
        updatedRecord && !updatedRecord.isNew
          ? [updatedRecord]
          : dataSource.filter((d) => !d.isNew && editingIds.includes(d.tempId));

      await handleSaveRecords(recordsToSave, updatedRecord);
    },
    [
      dataSource,
      editingIds,
      handleBulkCreateNewRows,
      handleSaveRecords,
      setEditingIds,
      setDataSource,
      setValidationErrors,
    ]
  );

  // Bulk operations
  const handleBulkDelete = useCallback(() => {
    setDataSource((prev) =>
      prev.filter((item) => !selectedRowKeys.includes(item.tempId))
    );
    setEditingIds((prev) => prev.filter((id) => !selectedRowKeys.includes(id)));
    setSelectedRowKeys([]);
  }, [selectedRowKeys, setDataSource, setEditingIds, setSelectedRowKeys]);

  const handleBulkUpdate = useCallback(
    async (updateData: Partial<T>) => {
      if (!onBulkUpdate) return;

      const realIds = selectedRowKeys
        .map((key) => {
          const record = dataSource.find((r) => r.tempId === key);
          return record && !record.isNew ? record.id : null;
        })
        .filter((id): id is number => id !== null);

      if (realIds.length > 0) {
        await onBulkUpdate(realIds, updateData);
      }
    },
    [onBulkUpdate, selectedRowKeys, dataSource]
  );

  const handleRestore = useCallback(
    async (ids: number[], deletedData: Partial<T>) => {
      if (onRestore) {
        await onRestore(ids, deletedData);
      }
    },
    [onRestore]
  );

  const handleBulkDeleteConfirm = useCallback(
    async (isPermanent = false) => {
      if (onBulkDelete) {
        const realIds = selectedRowKeys
          .map((key) => {
            const record = dataSource.find((r) => r.tempId === key);
            return record && !record.isNew ? record.id : null;
          })
          .filter((id): id is number => id !== null);

        if (realIds.length > 0) {
          await onBulkDelete(realIds, isPermanent);
        }
      }

      setDataSource((prev) =>
        prev.filter((item) => !selectedRowKeys.includes(item.tempId))
      );
      setEditingIds((prev) =>
        prev.filter((id) => !selectedRowKeys.includes(id))
      );
    },
    [onBulkDelete, selectedRowKeys, dataSource, setDataSource, setEditingIds]
  );

  const parseClipboard = useCallback((text: string) => {
    const trimmed = text.trim();

    if (!trimmed.includes("\n") && !trimmed.includes("\t")) {
      return trimmed;
    }

    return trimmed.split("\n").map((line) => line.split("\t"));
  }, []);

  const processClipboardValue = useCallback(
    (column: ColumnWithRenderFlag<any>, inputValue: string) => {
      const trimmedValue = inputValue?.trim();

      if (column.inputType === "select" && Array.isArray(column.options)) {
        const match = column.options.find(
          (opt: any) =>
            opt.label?.toLowerCase?.() === trimmedValue?.toLowerCase?.()
        );
        return match ? match.value : null;
      }

      if (column.inputType === "radio" && Array.isArray(column.options)) {
        const match = column.options.find(
          (opt: any) =>
            opt.label?.toLowerCase?.() === trimmedValue?.toLowerCase?.()
        );
        return match ? match.value : null;
      }

      if (column.inputType === "multiSelect" && Array.isArray(column.options)) {
        const names = (trimmedValue ?? "").split(",").map((n) => n.trim());
        const matched = column.options.filter((opt: any) =>
          names.some((n) => opt.label?.toLowerCase?.() === n.toLowerCase())
        );
        return matched.length > 0 ? matched.map((m: any) => m.value) : [];
      }

      if (column.inputType === "date") {
        const parsedDate = new Date(trimmedValue);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
      }

      return trimmedValue;
    },
    []
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      // ==== FIX: Stop kalau fokus ada di dalam Drawer atau Form ====
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl) {
        const isInsideDrawer = activeEl.closest(".ant-drawer");
        if (isInsideDrawer) {
          // biarkan paste masuk ke input di Drawer
          return;
        }
      }

      const editableColumns = columns.filter(
        (col) => col.editable && col.key !== "dragHandle"
      );
      if (editableColumns.length === 0) return;

      const clipboardData = e.clipboardData.getData("Text");
      const parsed = parseClipboard(clipboardData);

      // =============== CASE 1: Single Value (string) ===============
      if (typeof parsed === "string") {
        if (activeTempId !== null && activeColumnKey) {
          setDataSource((prev) => {
            const updated = [...prev];
            const row = updated.find((r) => r.tempId === activeTempId);
            if (row) {
              const col = columns.find((c) => c.key === activeColumnKey);
              if (col) {
                (row as any)[col.key] = processClipboardValue(col, parsed);
              }
            }
            return updated;
          });
        }
        e.preventDefault();
        return;
      }

      // =============== CASE 2: Multi Row/Column (array 2D) ===============
      const rows = parsed;
      setDataSource((prev) => {
        const updated = [...prev];
        let maxId = tempCounter;
        const editableEmptyRows = updated.filter((r) => {
          if (!r.isNew) return false;
          const keys = Object.keys(r).filter(
            (k) => !NON_DATA_KEYS.includes(k as any)
          );
          return keys.every((key) => {
            const value = (r as any)[key];
            return value === null || value === undefined || value === "";
          });
        });

        const newRows: Array<EditableRecord & T> = [];
        const newEditingIds = [...editingIds];

        rows.forEach((cols, idx) => {
          let targetRow: EditableRecord & T;

          if (editableEmptyRows[idx]) {
            targetRow = editableEmptyRows[idx];
          } else {
            targetRow = createDefaultRecord(maxId++, defaultValues);
            newRows.push(targetRow);
            newEditingIds.push(targetRow.tempId);
          }

          editableColumns.forEach((col, colIndex) => {
            const key = col.key as keyof T;
            const inputValue = cols[colIndex];
            const processedValue = processClipboardValue(col, inputValue);
            (targetRow as any)[key] = processedValue;
          });

          if (!newEditingIds.includes(targetRow.tempId)) {
            newEditingIds.push(targetRow.tempId);
          }
        });

        let insertIndex = updated.length;
        if (activeTempId !== null) {
          const idx = updated.findIndex((r) => r.tempId === activeTempId);
          if (idx !== -1) {
            insertIndex = idx + 1;
          }
        }

        updated.splice(insertIndex, 0, ...newRows);
        setTempCounter(maxId);
        setEditingIds([...new Set(newEditingIds)]);
        return updated;
      });

      e.preventDefault();
    },
    [
      columns,
      parseClipboard,
      tempCounter,
      editingIds,
      defaultValues,
      activeTempId,
      activeColumnKey,
      setDataSource,
      setTempCounter,
      setEditingIds,
      processClipboardValue,
    ]
  );

  const createIndexColumn = useCallback(
    (): ColumnType<EditableRecord & T> => ({
      title: "#",
      key: "index",
      width: 50,
      onHeaderCell: () => ({
        className: `${!useBulkAction && "!pl-6"}`,
      }),
      className: `${!useBulkAction && "!pl-6"}`,
      fixed: isMobile ? undefined : ("left" as const),
      render: (_value, _record, index) => (
        <span
          className={`transition-all duration-200 ${draggingRowIndex === index ? "opacity-50" : ""
            }`}
        >
          {(onPaginate
            ? (onPaginate.currentPage - 1) * onPaginate.sizePage + index
            : index) + 1}
        </span>
      ),
    }),
    [isMobile, draggingRowIndex, onPaginate]
  );

  const createDataColumn = useCallback(
    (column: ColumnWithRenderFlag<any>): ColumnType<EditableRecord & T> => ({
      title: typeof column.title === "string" ? column.title.toUpperCase() : column.title,
      dataIndex: column.dataIndex || column.key,
      key: column.key,
      align: "left",
      className: "ms-0",
      onHeaderCell: () => ({
        className: "tracking-wider text-xs! text-slate-500! dark:text-slate-300!",
      }),
      width:
        column.key === "name"
          ? columnWidth
          : column.width ?? DEFAULT_COLUMN_WIDTH,
      fixed: isMobile
        ? undefined
        : ["name", "code"].includes(column.key)
          ? ("left" as const)
          : undefined,
      filters: column.filters,
      sorter: column.sorter,
      filterSearch: column.filterSearch,
      filterDropdown: column.filterDropdown,
      filterMultiple: column.filterMultiple,
      onFilter: column.onFilter,
      render: (_value, record, index) => (
        <div
          className={`transition-all duration-200 ${draggingRowIndex === index ? "opacity-75" : ""
            }`}
        >
          <TableCell
            editMode={editingIds.includes(record.tempId)}
            column={column}
            record={record}
            isNew={record.isNew}
            isEditing={editingIds.includes(record.tempId)}
            onChange={(field, val) =>
              handleInputChange(record.tempId, field, val)
            }
            onSave={(updatedRecord) => handleCellSave(record, updatedRecord)}
            onFocus={() => {
              setActiveTempId(record.tempId);
              setActiveColumnKey(column.key);
            }}
            validationErrorKeys={validationErrors[record.tempId] || []}
            autoSave={autoSave}
          />
        </div>
      ),
    }),
    [
      columnWidth,
      isMobile,
      draggingRowIndex,
      editingIds,
      handleInputChange,
      handleCellSave,
      setActiveTempId,
      validationErrors,
      autoSave,
    ]
  );

  const createActionsColumn = useCallback(
    (): ColumnType<EditableRecord & T> => ({
      title: "",
      key: "actions",
      fixed: "right",
      width: 20,
      render: (_value, record, index) => {
        const isEditing = editingIds.includes(record.tempId);
        const actionVisibility = hideActions ? hideActions(record) : {};

        return (
          <div className="flex">
            <TableActions
              isFilterDeleted={isFilterDeleted}
              redirectModule={redirectModule}
              useDelete={useDelete}
              useEdit={useEdit}
              record={record}
              columns={columns as any}
              isEditing={isEditing}
              useModal={useModal}
              useDrawer={useDrawer}
              onDrawer={onDrawer}
              title={title}
              deleteConfirmTitle={deleteConfirmTitle}
              setEditingIds={setEditingIds}
              setDataSource={setDataSource}
              onActions={onActions}
              onRestore={async (record: EditableRecord & T) => {
                await handleRestore([record.id], {} as Partial<T>);
              }}
              onDelete={(record, isPermanent) =>
                handleDelete(record, setDataSource, setEditingIds, isPermanent)
              }
              onUpdate={onUpdate}
              customModal={customModal}
              hideEdit={actionVisibility?.hideEdit}
              hideDelete={actionVisibility?.hideDelete}
              redirectPage={redirectPage}
              onSaveNew={async (record) => {
                if (
                  record.isNew &&
                  onBulkCreate &&
                  typeof onBulkCreate === "function"
                ) {
                  await handleBulkCreateNewRows(
                    dataSource,
                    setEditingIds,
                    setDataSource,
                    setValidationErrors
                  );
                } else {
                  const success = await handleRowSave(record);
                  if (success) {
                    setDataSource((prev) =>
                      prev.filter((r) => r.tempId !== record.tempId)
                    );
                  }
                }
              }}
            />
          </div>
        );
      },
    }),
    [
      editingIds,
      draggingRowIndex,
      isFilterDeleted,
      redirectModule,
      useDelete,
      columns,
      useModal,
      useDrawer,
      deleteConfirmTitle,
      setEditingIds,
      setDataSource,
      handleDelete,
      onUpdate,
      hideActions,
      redirectPage,
      onBulkCreate,
      handleBulkCreateNewRows,
      dataSource,
      setValidationErrors,
      handleRowSave,
    ]
  );

  const createTrashFilterColumn = useCallback(
    (): ColumnType<EditableRecord & T> => ({
      title: "",
      key: "trashFilter",
      fixed: "right",
      width: 30,
      ...ColumnSearch("", {
        mode: "options",
        selectOptions: [{ label: "Deleted Data", value: 1 }],
        onSearch: (value) => {
          if (value) {
            setIsFilterDeleted(true);
            filterDeleted && filterDeleted(true);
          }
          return false;
        },
        onReset: () => {
          setIsFilterDeleted(false);
          filterDeleted && filterDeleted(false);
          return false;
        },
      }),
    }),
    [
      editingIds,
      draggingRowIndex,
      isFilterDeleted,
      redirectModule,
      useDelete,
      columns,
      useModal,
      useDrawer,
      deleteConfirmTitle,
      setEditingIds,
      setDataSource,
      handleDelete,
      onUpdate,
      redirectPage,
    ]
  );

  const tableColumns: ColumnsType<EditableRecord & T> = useMemo(() => {
    const indexColumn = createIndexColumn();
    const actionsColumn = createActionsColumn();
    const trashFilterColumn = createTrashFilterColumn();

    const dragColumn = normalizedColumns.find((col) => col.key === "dragHandle");
    const remainingColumns = normalizedColumns.filter(
      (col) => col.key !== "dragHandle"
    );

    const specialColumns = new Map<string, ColumnWithRenderFlag<any>>();
    const otherColumns: ColumnWithRenderFlag<any>[] = [];

    remainingColumns.forEach((col) => {
      if (SPECIAL_COLUMNS.includes(col.key as any)) {
        specialColumns.set(col.key, col);
      } else {
        otherColumns.push(col);
      }
    });

    const dataColumns: ColumnType<EditableRecord & T>[] = [];

    SPECIAL_COLUMNS.forEach((key) => {
      const column = specialColumns.get(key);
      if (column) {
        dataColumns.push(createDataColumn(column));
      }
    });

    otherColumns
      .filter((col) => col.renderDataView)
      .forEach((col) => {
        dataColumns.push(createDataColumn(col));
      });

    const cols: ColumnType<EditableRecord & T>[] = [];

    if (dragColumn && dragColumn.renderDataView !== false) {
      cols.push(createDataColumn(dragColumn));
    }

    cols.push(indexColumn, ...dataColumns);

    useColumnAction && cols.push(actionsColumn);
    useTrashFilter && cols.push(trashFilterColumn);

    return cols;
  }, [
    createIndexColumn,
    createDataColumn,
    createActionsColumn,
    createTrashFilterColumn,
    normalizedColumns,
  ]);

  const handleHeaderSave = useCallback(async () => {
    const newRecords = dataSource.filter(
      (data) => data.isNew && editingIds.includes(data.tempId)
    );
    const existingRecords = dataSource.filter(
      (data) => !data.isNew && editingIds.includes(data.tempId)
    );

    const allRecordsToValidate = [...newRecords, ...existingRecords];
    const validationErrors = validateRecords(allRecordsToValidate);

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      return;
    }

    setValidationErrors({});
    let allSuccess = true;

    if (newRecords.length > 0) {
      const success = await handleBulkCreateNewRows(
        dataSource,
        setEditingIds,
        setDataSource,
        setValidationErrors
      );
      if (!success) allSuccess = false;
    }

    if (existingRecords.length > 0) {
      const results = await Promise.all(
        existingRecords.map((r) => handleRowSave(r, true))
      );
      if (!results.every((res) => res)) allSuccess = false;
    }

    if (allSuccess && newRecords.length > 0) {
      setDataSource((prev) => prev.filter((r) => !r.isNew));
    }
  }, [
    dataSource,
    editingIds,
    validateRecords,
    setValidationErrors,
    handleBulkCreateNewRows,
    setEditingIds,
    setDataSource,
    handleRowSave,
  ]);

  const getEnhancedRowProps = useCallback(
    (record: EditableRecord & T, index?: number) => {
      const recordIndex = index ?? 0;
      const baseProps = rowProps ? rowProps(record, recordIndex) : {};
      return { ...baseProps };
    },
    [rowProps]
  );

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      const activeIndex = dataSource.findIndex(
        (item) => item.tempId === active.id
      );
      setDraggingRowIndex(activeIndex >= 0 ? activeIndex : null);
    },
    [dataSource]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) {
        setDraggingRowIndex(null);
        return;
      }

      setDataSource((prev) => {
        const activeIndex = prev.findIndex((item) => item.tempId === active.id);
        const overIndex = prev.findIndex((item) => item.tempId === over.id);

        if (activeIndex === -1 || overIndex === -1) {
          return prev;
        }

        const currentData = prev[activeIndex];
        const targetData = prev[overIndex];
        const reordered = arrayMove(prev, activeIndex, overIndex);

        if (currentData && targetData) {
          onDrag?.(targetData, currentData);
        }
        onDragEnd?.(reordered as T[]);

        return reordered;
      });

      setDraggingRowIndex(null);
    },
    [onDrag, onDragEnd, setDataSource]
  );

  return (
    <div className="flex flex-col gap-y-2 h-full">
      <HeaderAction
        columns={columns as any}
        title={title}
        description={description}
        useHeaderAction={useHeaderAction}
        useModal={useModal}
        useDrawer={useDrawer}
        useGenerator={useGenerator}
        onGenerator={onGenerator!}
        onDrawer={onDrawer}
        defaultValues={defaultValues}
        onAdd={onCreate}
        onChange={handleInputChange}
        onSave={handleHeaderSave}
        disableSave={editingIds.length === 0}
        selectedRowKeys={selectedRowKeys}
        onBulkDelete={handleBulkDelete}
        addButtonText={addButtonText}
        addGeneratorText={addGeneratorText}
        autoSave={autoSave}
        onImport={onImport}
      />
      <div
        className="flex-1 min-h-0"
        ref={tableContainerRef}
        onPaste={handlePaste}
      >
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingRowIndex(null)}
        >
          <SortableContext
            items={dataSource.map((item) => item.tempId)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              className="h-full mb-2 relative z-0 [&_.ant-table-placeholder]:pointer-events-none [&_.ant-table-placeholder]:z-0"
              size="small"
              key="stable-table"
              {...(useBulkAction ? { rowSelection } : {})}
              columns={tableColumns}
              dataSource={dataSource.map((row) => {
                if (row && typeof row === "object" && "children" in row) {
                  const clone = { ...row };
                  delete (clone as any).children;
                  return clone;
                }
                return row;
              })}
              rowKey="tempId"
              loading={loading}
              pagination={false}
              scroll={{ x: "max-content", y: TABLE_SCROLL_HEIGHT }}
              components={{ body: { row: DragRow } }}
              onRow={(record, index) => ({
                ...getEnhancedRowProps(record, index),
                onClick: rowClickUpdate ? () => handleRowClick(record) : undefined,
              })}
              onChange={(pagination, filters, sorter) =>
                onChange?.(pagination, filters, sorter)
              }
            />
          </SortableContext>
        </DndContext>

        <div className="flex justify-between">
          <FooterAction
            onAddRow={handleAddRow}
            useBulkAction={false}
            selectedRowKeys={[]}
            onBulkDelete={() => { }}
            useFooterAction={useFooterAction}
            addButtonText={addButtonText}
            dataSource={dataSource}
            onPaginate={onPaginate}
          />
        </div>
      </div>

      {useBulkAction && (
        <BulkActionBar<T>
          onRestore={handleRestore}
          isFilterDeleted={isFilterDeleted}
          selectedCount={selectedRowKeys.length}
          selectedRowKeys={selectedRowKeys}
          selectedRecords={getSelectedRecords()}
          allRecords={dataSource}
          columns={columns}
          onBulkUpdate={onBulkUpdate ? handleBulkUpdate : undefined}
          onBulkDelete={handleBulkDeleteConfirm}
          useDelete={useDelete}
          onClear={() => setSelectedRowKeys([])}
          onSelectAll={() =>
            setSelectedRowKeys(dataSource.map((d) => d.tempId))
          }
          onSelectRows={setSelectedRowKeys}
          totalCount={dataSource.length}
        />
      )}
    </div>
  );
}
