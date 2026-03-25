"use client";
import React from "react";

import {
  EditableRecord,
  TableBuilderProps,
  BaseRecord,
} from "@/types/props/table.types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatDateToIso } from "@/lib/formatDate";
import DatePicker from "../DatePicker";
import ColorPicker from "../ColorPicker";
import { Input, Select, Radio, TreeSelect } from "antd";
const { RangePicker } = DatePicker;

dayjs.extend(utc);

interface EditableCellProps<T extends BaseRecord> {
  column: TableBuilderProps<T>["columns"][0];
  record: EditableRecord & T;
  isEditing: boolean;
  editMode?: boolean;
  isNew?: boolean;
  onHeaderCell?: () => void;
  onFocus?: () => void;
  onChange: (field: keyof T, value: any) => void;
  validationErrorKeys?: string[];
  onSave?: (updatedRecord?: any) => void;
  autoSave?: boolean;
}

export function TableCell<T extends BaseRecord>({
  column,
  record,
  editMode,
  onChange,
  onFocus,
  onSave,
  validationErrorKeys = [],
  autoSave,
}: EditableCellProps<T>) {
  const field = column.key as keyof T;
  const value = record[field];
  const inputType = column.inputType ?? "text";
  const isEditing = record.isNew || editMode;

  const hasError = validationErrorKeys.includes(field as string);
  const errorMessage =
    column.rules?.find((r) => r.required)?.message || "Wajib diisi";

  // Get dynamic options if available, fallback to static options
  const currentOptions = column.getDynamicOptions
    ? column.getDynamicOptions(record)
    : column.options;

  if (!column.editable || !isEditing) {
    if (!column.renderDataView) return null;
    if (column.renderCell) return column.renderCell(value, record);
    return <>{String(value)}</>;
  }

  const commonInputProps = {
    placeholder: column.placeholder,
    status: hasError ? ("error" as const) : undefined,
    onFocus,
  };

  // Helper function untuk mendapatkan value yang tepat untuk multiSelect
  const getMultiSelectValue = () => {
    if (!Array.isArray(value)) return [];

    // Jika ada getValueFromRecord, gunakan itu (dengan type assertion)
    if ((column as any).getValueFromRecord) {
      return (column as any).getValueFromRecord(record);
    }

    // Fallback: convert value ke format yang sesuai dengan options
    return value
      .map((item: any) => {
        // Jika item adalah object dengan id, return id-nya
        if (typeof item === "object" && item && "id" in item) {
          return item.id;
        }
        // Jika item adalah object dengan value, return value-nya
        if (typeof item === "object" && item && "value" in item) {
          return item.value;
        }
        // Jika item sudah berupa primitive value, return as is
        return item;
      })
      .filter(Boolean);
  };

  return (
    <div className="relative">
      {inputType === "select" ? (
        <Select
          {...commonInputProps}
          value={value ?? "-"}
          style={{ width: "100%" }}
          options={currentOptions?.map((opt) => ({
            ...opt,
            key: opt.value ?? opt.label,
          }))}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "")
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          onSearch={(value) => {
            column.onSearch?.(value);
          }}
          onChange={(val) => {
            const updatedRecord = { ...record, [field]: val };
            onChange(field, val);
            if (autoSave) {
              onSave?.(updatedRecord);
            }
            // Call onFieldChange if provided
            if (column.onFieldChange) {
              column.onFieldChange(field as string, val, record);
            }
          }}
        />
      ) : inputType === "radio" ? (
        <Radio.Group
          {...commonInputProps}
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            const updatedRecord = { ...record, [field]: val };
            onChange(field, val);
            if (autoSave) {
              onSave?.(updatedRecord);
            }
            if (column.onFieldChange) {
              column.onFieldChange(field as string, val, record);
            }
          }}
          options={currentOptions}
        />
      ) : inputType === "multiSelect" ? (
        <Select
          mode="multiple"
          allowClear
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "-")
              .toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          style={{ width: "100%" }}
          placeholder={column.placeholder}
          value={getMultiSelectValue()}
          onSearch={(value) => {
            column.onSearch?.(value);
          }}
          onChange={(val) => {
            const updatedRecord = { ...record, [field]: val };
            onChange(field, val);
            if (autoSave) {
              onSave?.(updatedRecord);
            }
            // Call onFieldChange if provided
            if (column.onFieldChange) {
              column.onFieldChange(field as string, val, record);
            }
          }}
          options={currentOptions?.map((opt, idx) => ({
            label: opt.label,
            value: opt.value ?? opt.label ?? `option-${idx}`,
          }))}
        />

      ) : inputType === "treeSelect" ? (
        <TreeSelect
          style={{ width: "100%" }}
          value={value}
          treeData={currentOptions || []}
          onChange={(val) => {
            const updatedRecord = { ...record, [field]: val };
            onChange(field, val);
            if (autoSave) {
              onSave?.(updatedRecord);
            }
            if (column.onFieldChange) {
              column.onFieldChange(field as string, val, record);
            }
          }}
          treeCheckable
          showSearch
          allowClear
          showCheckedStrategy={TreeSelect.SHOW_CHILD}
          placeholder={column.placeholder || "Silakan pilih"}
          treeDefaultExpandAll
          filterTreeNode={(input, treeNode) =>
            (treeNode?.title ?? '').toString().toLowerCase().includes(input.toLowerCase())
          }
        />

      ) : inputType === "color" ? (
        <ColorPicker
          onChange={(color) => {
            const updatedRecord = { ...record, [field]: color.toHexString() };
            onChange(field, color.toHexString());
            if (autoSave) {
              onSave?.(updatedRecord);
            }
          }}
          format="hex"
          size="small"
          style={{ width: "100%" }}
          value={value ?? "#000000"}
        />
      ) : inputType === "date" ? (
        <DatePicker
          {...commonInputProps}
          value={value ? dayjs(value) : null}
          onChange={(date, dateString) => {
            if (date && typeof dateString === "string") {
              const updatedRecord = {
                ...record,
                [field]: formatDateToIso(dateString),
              };
              onChange(field, formatDateToIso(dateString));
              if (autoSave) {
                onSave?.(updatedRecord);
              }
            }
          }}
          style={{ width: "100%" }}
        />
      ) : inputType === "dateRange" ? (
        <RangePicker
          {...commonInputProps}
          format="DD-MM-YYYY"
          value={
            (record as any).start_date && (record as any).end_date
              ? [
                dayjs((record as any).start_date),
                dayjs((record as any).end_date),
              ]
              : null
          }
          onChange={(dates, dateStrings) => {
            if (dates && dates[0] && dates[1]) {
              // Update both start_date and end_date
              onChange(
                "start_date" as keyof T,
                formatDateToIso(dateStrings[0])
              );
              onChange("end_date" as keyof T, formatDateToIso(dateStrings[1]));
              const updatedRecord = {
                ...record,
                start_date: dates?.[0] ? formatDateToIso(dateStrings[0]) : null,
                end_date: dates?.[1] ? formatDateToIso(dateStrings[1]) : null,
              };
              if (autoSave) {
                onSave?.(updatedRecord);
              }
            } else {
              // Clear both dates if range is cleared
              onChange("start_date" as keyof T, null);
              onChange("end_date" as keyof T, null);
            }
          }}
          style={{ width: "100%" }}
          placeholder={["Tanggal Mulai", "Tanggal Selesai"]}
        />
      ) : (
        <Input
          key={`${record.id}-${String(field)}`}
          {...commonInputProps}
          type={inputType}
          value={value ?? "-"}
          onPaste={(e) => e.preventDefault()}
          onChange={(e) => {
            onChange(
              field,
              inputType === "number" ? Number(e.target.value) : e.target.value
            );
          }}
          onBlur={(e) => {
            if (autoSave) {
              e.preventDefault();
              onSave?.({ ...record, [field]: e.currentTarget.value });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSave?.({ ...record, [field]: e.currentTarget.value });
            }
          }}
        />
      )}
      {hasError && (
        <div className="text-red-500 text-xs mt-1">{errorMessage}</div>
      )}
    </div>
  );
}
