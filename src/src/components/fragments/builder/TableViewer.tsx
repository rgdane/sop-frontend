"use client";

import { useEffect, useMemo, useState } from "react";
import { Table, Button } from "antd";
import { DownOutlined, RightOutlined, UpOutlined } from "@ant-design/icons";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import {
  BaseRecord,
  EditableRecord,
  TableBuilderProps,
} from "@/types/props/table.types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { twMerge } from "tailwind-merge";

dayjs.extend(customParseFormat);

const possibleDateFormats = [
  "MMM DD",
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY/MM/DD",
];

type TableViewerProps<T extends BaseRecord> = Omit<
  TableBuilderProps<T>,
  | "onCreate"
  | "onUpdate"
  | "onDelete"
  | "onBulkCreate"
  | "onBulkUpdate"
  | "onBulkDelete"
  | "onFieldChange"
  | "onGenerator"
  | "useModal"
  | "useDrawer"
  | "useDelete"
  | "useBulkAction"
  | "useHeaderAction"
  | "useFooterAction"
  | "hideActions"
  | "autoSave"
  | "rowClickUpdate"
> & {
  showIndex?: boolean;
  className?: string;
  showDescriptionToggle?: boolean;
  descriptionKey?: string;
  onRowDescriptionToggle?: (recordId: any, visible: boolean) => void;
};

type ExtendedRecord<T extends BaseRecord> = EditableRecord & T;

export function TableViewer<T extends BaseRecord>({
  datas,
  columns,
  currentPage,
  pageSize,
  className = "",
  loading = false,
  redirectPage = null,
  rowProps,
  redirectModule = "",
  onPaginate,
  showIndex = true,
  showDescriptionToggle = false,
  descriptionKey = "description",
  onRowDescriptionToggle,
}: TableViewerProps<T>) {
  const [dataSource, setDataSource] = useState<Array<ExtendedRecord<T>>>([]);
  const [globalDescriptionVisible, setGlobalDescriptionVisible] =
    useState(true);
  const [rowDescriptionVisibility, setRowDescriptionVisibility] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const mapped = datas.map((item, index) => ({
      ...item,
      tempId: index,
    })) as Array<ExtendedRecord<T>>;
    setDataSource(mapped);

    // Initialize row visibility
    if (showDescriptionToggle) {
      const initialVisibility: Record<string, boolean> = {};
      mapped.forEach((item) => {
        initialVisibility[item.tempId] = globalDescriptionVisible;
      });
      setRowDescriptionVisibility(initialVisibility);
    }
  }, [datas, globalDescriptionVisible, showDescriptionToggle]);

  const normalizedColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      renderDataView: col.renderDataView ?? true,
    }));
  }, [columns]);

  const handleGlobalToggle = () => {
    const newVisibility = !globalDescriptionVisible;
    setGlobalDescriptionVisible(newVisibility);
  };

  const handleRowToggle = (recordId: any) => {
    setRowDescriptionVisibility((prev) => {
      const newVisibility = !prev[recordId];
      const updated = { ...prev, [recordId]: newVisibility };
      onRowDescriptionToggle?.(recordId, newVisibility);
      return updated;
    });
  };

  const tableColumns: ColumnsType<ExtendedRecord<T>> = useMemo(() => {
    const cols: ColumnsType<ExtendedRecord<T>> = [];

    // Index column
    if (showIndex) {
      cols.push({
        title: <span style={{ paddingLeft: 20 }}>#</span>,
        key: "index",
        width: 60,
        align: "left",
        render: (_value: any, _record: ExtendedRecord<T>, index: number) => (
          <span style={{ paddingLeft: 20 }}>
            {(onPaginate
              ? (onPaginate.currentPage - 1) * onPaginate.sizePage + index
              : index) + 1}
          </span>
        ),
      });
    }

    const dataColumns = normalizedColumns
      .filter((col) => col.renderDataView)
      .map((col, idx): ColumnType<ExtendedRecord<T>> => {
        const baseColumn = {
          title: col.title,
          key: col.key || String(col.dataIndex),
          width: col.width,
          align: col.align,
          sorter: col.sorter,
          fixed: col.fixed,
          ellipsis: col.ellipsis,
          className: col.className,
        } as ColumnType<ExtendedRecord<T>>;

        if (col.dataIndex) {
          baseColumn.dataIndex = col.dataIndex as any;
        }

        const isNameColumn =
          idx === 0 ||
          col.dataIndex === "nama" ||
          col.dataIndex === "name" ||
          String(col.dataIndex).toLowerCase().includes("name");

        if (showDescriptionToggle && isNameColumn) {
          baseColumn.render = (value: any, record: ExtendedRecord<T>) => {
            const isVisible =
              rowDescriptionVisibility[record.tempId] ??
              globalDescriptionVisible;

            const originalRender =
              (col as any).render || (col as any).renderCell;
            const displayValue = originalRender
              ? originalRender(value, record)
              : value;

            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleRowToggle(record.tempId)}
              >
                <span style={{ flex: 1 }}>{displayValue}</span>
                <Button
                  type="text"
                  size="small"
                  icon={isVisible ? <UpOutlined /> : <DownOutlined />}
                  tabIndex={-1}
                  style={{
                    marginLeft: 4,
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}
                />
              </div>
            );
          };
        } else if (showDescriptionToggle && col.dataIndex === descriptionKey) {
          // Description column - show/hide based on visibility
          baseColumn.render = (value: any, record: ExtendedRecord<T>) => {
            const isVisible =
              rowDescriptionVisibility[record.tempId] ??
              globalDescriptionVisible;

            if (!isVisible) return null;

            const originalRender =
              (col as any).render || (col as any).renderCell;
            return originalRender ? originalRender(value, record) : value;
          };
        } else {
          // Default render for other columns
          const originalRender = (col as any).render || (col as any).renderCell;
          if (originalRender) {
            baseColumn.render = originalRender;
          }
        }

        return baseColumn;
      });

    cols.push(...dataColumns);
    return cols;
  }, [
    normalizedColumns,
    showIndex,
    onPaginate,
    showDescriptionToggle,
    descriptionKey,
    rowDescriptionVisibility,
    globalDescriptionVisible,
    handleRowToggle,
  ]);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (!Array.isArray(sorter) && sorter.order && sorter.field) {
      const sortedData = [...dataSource].sort((a, b) => {
        const aVal = (a as any)[sorter.field];
        const bVal = (b as any)[sorter.field];

        // Date parsing
        const dtA =
          typeof aVal === "string"
            ? dayjs(aVal, possibleDateFormats, true)
            : undefined;
        const dtB =
          typeof bVal === "string"
            ? dayjs(bVal, possibleDateFormats, true)
            : undefined;

        if (dtA && dtB && dtA.isValid() && dtB.isValid()) {
          return sorter.order === "ascend"
            ? dtA.valueOf() - dtB.valueOf()
            : dtB.valueOf() - dtA.valueOf();
        }

        // Number sorting
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sorter.order === "ascend" ? aVal - bVal : bVal - aVal;
        }

        // String sorting
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sorter.order === "ascend"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return 0;
      });
      setDataSource(sortedData);
    }
  };

  const processedDataSource = useMemo(() => {
    return dataSource.map((row) => {
      if (row && typeof row === "object" && "children" in row) {
        const clone = { ...row };
        delete (clone as any).children;
        return clone;
      }
      return row;
    });
  }, [dataSource]);

  return (
    <div className={twMerge("flex flex-col gap-y-2 h-full", className)}>
      {showDescriptionToggle && (
        <div className="flex justify-end mb-2">
          <Button
            icon={
              globalDescriptionVisible ? (
                <EyeOutlined />
              ) : (
                <EyeInvisibleOutlined />
              )
            }
            onClick={handleGlobalToggle}
          >
            {globalDescriptionVisible ? "Sembunyikan Semua" : "Tampilkan Semua"}
          </Button>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <Table<ExtendedRecord<T>>
          className="h-full mb-2"
          size="small"
          key="stable-table"
          columns={tableColumns}
          dataSource={processedDataSource}
          rowKey="tempId"
          loading={loading}
          pagination={false}
          scroll={{ x: "max-content", y: 550 }}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}
