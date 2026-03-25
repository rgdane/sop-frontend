import React from "react";
import type { CustomColumnProps } from "./column.types";
import {
  ColumnType,
  FilterValue,
  SorterResult,
  TablePaginationConfig,
} from "antd/es/table/interface";

export interface BaseRecord {
  id: number;
  code?: string;
  [key: string]: any;
}

export interface EditableRecord extends BaseRecord {
  isNew?: boolean;
  tempId: number;
  name?: string;
}

export interface CustomPagination {
  currentPage: number;
  totalPage: number;
  sizePage: number;
  setPage?: (page: number) => void;
  onLoadData: any;
}

export interface TableBuilderProps<T extends BaseRecord> {
  datas: T[];
  defaultValues?: any;
  title?: string;
  description?: string;
  columns: Array<CustomColumnProps<T>>;
  currentPage?: number;
  pageSize?: number;
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter:
      | SorterResult<EditableRecord & T>
      | SorterResult<EditableRecord & T>[],
    extra?: {
      currentDataSource: T[];
      action: "paginate" | "sort" | "filter";
    }
  ) => void;
  filterDeleted?: (isDeleted: boolean) => void;
  onActions?: (record: EditableRecord & T) => void;
  onRestore?: (ids: number[], data: Partial<T>) => Promise<void>;
  onCreate?: (data: Omit<T, "id">) => Promise<void>;
  onUpdate?: (id: number, data: Partial<T>) => Promise<void>;
  onDelete?: (id: number, isPermanent?: boolean) => Promise<void>;
  onBulkCreate?: (data: Omit<T, "id">[]) => Promise<void>;
  onBulkUpdate?: (ids: number[], data: Partial<T>) => Promise<void>;
  onBulkDelete?: (ids: number[], isPermanent?: boolean) => Promise<void>;
  onDrawer?: {
    open?: () => void;
    close?: () => void;
  };
  onModal?: () => {
    open: boolean;
    onClose: () => void;
  };
  onGenerator?: {
    onGenerate: (data: any) => Promise<void>;
    title?: string;
  };
  onFieldChange?: (
    tempId: number,
    field: keyof T,
    value: any,
    record: EditableRecord & T
  ) => void;
  loading?: boolean;
  addButtonText?: string;
  addGeneratorText?: string;
  deleteConfirmTitle?: string;
  emptyRecord?: Partial<T>;
  useModal?: boolean;
  useDrawer?: boolean;
  useGenerator?: boolean;
  useDelete?: boolean;
  useEdit?: boolean;
  useBulkAction?: boolean;
  useHeaderAction?: boolean;
  useFooterAction?: boolean;
  useColumnAction?: boolean;
  hideActions?: (record: T) => { hideEdit?: boolean; hideDelete?: boolean };
  redirectPage?: string | null;
  redirectModule?: string;
  onPaginate?: CustomPagination;
  customHeaderContent?: React.ReactNode;
  autoSave?: boolean;
  rowClickUpdate?: boolean;
  rowProps?: (
    record: T,
    index: number
  ) => {
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    className?: string;
    style?: React.CSSProperties;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    [key: string]: any;
  };
  onDrag?: (targetData: EditableRecord & T, currentData: EditableRecord & T) => void;
  onDragEnd?: (reorderedData: T[]) => void;
  customModal?: any;
  useTrashFilter?: boolean;
  onImport?: any;
}
