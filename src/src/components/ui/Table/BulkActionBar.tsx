"use client";

import React, { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import {
  Select,
  Input,
  Popconfirm,
  DatePicker,
  ColorPicker,
  InputNumber,
  Radio,
} from "antd";
import dayjs from "dayjs";
import {
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  CheckOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { BaseRecord, TableBuilderProps } from "@/types/props/table.types";
import { TbRestore, TbTrash } from "react-icons/tb";

interface BulkActionBarProps<T extends BaseRecord> {
  isFilterDeleted?: boolean;
  onRestore?: (ids: number[], data: Partial<T>) => Promise<void>;
  selectedCount: number;
  selectedRowKeys: React.Key[];
  selectedRecords: T[];
  allRecords?: T[]; // Add all records for row selection
  columns: TableBuilderProps<T>["columns"];
  onBulkUpdate?: (data: Partial<T>) => Promise<void>;
  onBulkDelete: (isPermanent?: boolean) => Promise<void>;
  onClear: () => void;
  onSelectAll?: () => void;
  onSelectRows?: (rowKeys: React.Key[]) => void; // Add row selection handler
  totalCount?: number;
  useDelete?: boolean;
}

interface FieldOption {
  key: string;
  label: string;
  icon: React.ReactNode;
  inputType: string;
  options?: Array<{ label: string; value: any }>;
}

export function BulkActionBar<T extends BaseRecord>({
  isFilterDeleted,
  onRestore,
  selectedCount,
  selectedRowKeys,
  allRecords = [],
  columns,
  useDelete,
  onBulkUpdate,
  onBulkDelete,
  onClear,
  onSelectRows,
  totalCount,
}: BulkActionBarProps<T>) {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const inputSectionRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<any>(null);

  // Update visibility based on selectedCount
  useEffect(() => {
    if (selectedCount > 0 && !isVisible) {
      setIsVisible(true);
    }
  }, [selectedCount, isVisible]);

  // Global keyboard event handler
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // Hanya aktif ketika ada field yang dipilih dan tidak dalam state loading
      if (selectedField && !loading && canApply()) {
        if (e.key === "Enter") {
          // Periksa apakah focus ada di dalam input section
          const activeElement = document.activeElement;
          const inputSection = inputSectionRef.current;

          if (
            inputSection &&
            (inputSection.contains(activeElement) ||
              activeElement === document.body)
          ) {
            e.preventDefault();
            handleApplyUpdate();
          }
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleGlobalKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyPress);
    };
  }, [selectedField, loading, fieldValue]); // Dependencies untuk memastikan handler selalu up-to-date

  // Create field options from editable columns
  const fieldOptions: FieldOption[] = columns
    .filter((col) => (col.useBulkAction ?? true) && col.editable && col.key !== "id")
    .map((col) => ({
      key: col.key,
      label: typeof col.title === "string" ? col.title : "",
      icon: getFieldIcon(col.inputType || "text", col.key),
      inputType: col.inputType || "text",
      options: col.options,
    }));

  function getFieldIcon(inputType: string, fieldKey?: string) {
    // Check field key for more specific icons
    if (fieldKey) {
      if (fieldKey.toLowerCase().includes("status")) return <TagOutlined />;
      if (fieldKey.toLowerCase().includes("priority")) return <TagOutlined />;
      if (
        fieldKey.toLowerCase().includes("assignee") ||
        fieldKey.toLowerCase().includes("user")
      )
        return <UserOutlined />;
      if (fieldKey.toLowerCase().includes("date")) return <CalendarOutlined />;
    }

    // Fallback to input type
    switch (inputType) {
      case "select":
      case "multiSelect":
        return <TagOutlined />;
      case "date":
      case "dateRange":
        return <CalendarOutlined />;
      default:
        return <EditOutlined />;
    }
  }

  const handleFieldSelect = (fieldKey: string) => {
    setSelectedField(fieldKey);
    setFieldValue(null);
  };

  const handleApplyUpdate = async () => {
    if (!selectedField || fieldValue === null) return;
    if (!onBulkUpdate) return;

    setLoading(true);
    try {
      const field = fieldOptions.find((f) => f.key === selectedField);
      let updateData: Partial<T>;

      if (field?.inputType === "dateRange" && fieldValue) {
        updateData = {
          start_date: fieldValue.start_date,
          end_date: fieldValue.end_date,
        } as unknown as Partial<T>;
      } else {
        updateData = { [selectedField]: fieldValue } as Partial<T>;
      }

      await onBulkUpdate(updateData);

      // Close inline edit section after successful/failed update
      setSelectedField(null);
      setFieldValue(null);
    } catch (error) {
      setSelectedField(null);
      setFieldValue(null);
    } finally {
      setLoading(false);
    }
  };
  const handleRestore = async (ids: number[]): Promise<void> => {
    const field = columns.find((f) => f.key === "deleted_at");
    let deletedData: Partial<T> = {};

    if (onRestore) {
      await onRestore(ids, deletedData);
    }
  };

  // Fungsi untuk handle delete dengan async
  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await onBulkDelete();
    } catch (error) {
      console.error("Bulk delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle close button - this is the only way to close the bar
  const handleClose = () => {
    // setIsVisible(false);
    setSelectedField(null);
    setFieldValue(null);
    onClear();
  };

  // Enhanced keyboard handler untuk input elements
  const createKeyboardHandler =
    (additionalHandler?: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && canApply() && !loading) {
        e.preventDefault();
        e.stopPropagation();
        handleApplyUpdate();
      } else if (additionalHandler) {
        additionalHandler();
      }
    };

  const renderInlineInput = () => {
    if (!selectedField) return null;

    const field = fieldOptions.find((f) => f.key === selectedField);
    if (!field) return null;

    const keyboardHandler = createKeyboardHandler();

    switch (field.inputType) {
      case "select":
        return (
          <Select
            style={{ width: "100%" }}
            placeholder={`Pilih ${field.label.toLowerCase()}`}
            options={field.options}
            value={fieldValue}
            onChange={setFieldValue}
            showSearch
            size="small"
            autoFocus
            onKeyDown={keyboardHandler}
            onInputKeyDown={keyboardHandler} // Alternative untuk beberapa versi antd
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        );
      case "multiSelect":
        return (
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder={`Pilih ${field.label.toLowerCase()}`}
            options={field.options}
            value={fieldValue}
            onChange={setFieldValue}
            showSearch
            size="small"
            autoFocus
            onKeyDown={keyboardHandler}
            onInputKeyDown={keyboardHandler} // Alternative untuk beberapa versi antd
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        );
      case "date":
        return (
          <DatePicker
            size="small"
            placeholder={`Pilih ${field.label.toLowerCase()}`}
            value={fieldValue ? dayjs(fieldValue) : null}
            onChange={(date) => setFieldValue(date?.format("YYYY-MM-DD") || "")}
            onKeyDown={keyboardHandler}
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
            autoFocus
          />
        );
      case "number":
        return (
          <InputNumber
            size="small"
            placeholder="Masukkan angka"
            value={fieldValue}
            onChange={setFieldValue}
            onKeyDown={keyboardHandler}
            style={{ width: "100%" }}
            autoFocus
          />
        );
      case "dateRange":
        return (
          <DatePicker.RangePicker
            size="small"
            placeholder={["Tanggal mulai", "Tanggal selesai"]}
            value={
              fieldValue?.start_date && fieldValue?.end_date
                ? [dayjs(fieldValue.start_date), dayjs(fieldValue.end_date)]
                : null
            }
            onChange={(dates) => {
              if (dates) {
                setFieldValue({
                  start_date: dates[0]?.format("YYYY-MM-DD") || "",
                  end_date: dates[1]?.format("YYYY-MM-DD") || "",
                });
              } else {
                setFieldValue({ start_date: "", end_date: "" });
              }
            }}
            onKeyDown={keyboardHandler}
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
            autoFocus
          />
        );
      case "radio":
        return (
          <Radio.Group
            options={field.options}
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            size="small"
            style={{ width: "100%" }}
          />
        )
      case "color":
        return (
          <div onKeyDown={keyboardHandler} style={{ width: "100%" }}>
            <ColorPicker
              value={fieldValue || "#000000"}
              onChange={(color) => {
                const hexValue = color.toHexString();
                setFieldValue(hexValue);
              }}
              showText
              size="small"
              placement="topLeft"
              onOpenChange={(open) => {
                if (open && colorPickerRef.current) {
                  setTimeout(() => {
                    const colorPickerElement =
                      colorPickerRef.current?.nativeElement;
                    if (colorPickerElement) {
                      colorPickerElement.focus();
                    }
                  }, 100);
                }
              }}
              style={{ width: "100%" }}
            />
          </div>
        );
      default:
        return (
          <Input
            size="small"
            placeholder={`Masukkan ${field.label.toLowerCase()}`}
            value={fieldValue || ""}
            onChange={(e) => setFieldValue(e.target.value)}
            onKeyDown={keyboardHandler}
            autoFocus
          />
        );
    }
  };

  const canApply = () => {
    if (!selectedField) return false;
    const field = fieldOptions.find((f) => f.key === selectedField);

    if (field?.inputType === "dateRange") {
      return fieldValue && (fieldValue.start_date || fieldValue.end_date);
    }

    if (field?.inputType === "date") {
      return fieldValue && fieldValue !== "";
    }

    if (field?.inputType === "color") {
      return fieldValue && fieldValue !== null && fieldValue !== undefined;
    }

    return fieldValue !== null && fieldValue !== "" && fieldValue !== undefined;
  };

  return (
    (onBulkUpdate || useDelete) && (
      <>
        <div
          className={`fixed z-50 transition-transform duration-300
            ${selectedRowKeys.length > 0
              ? "opacity-100 visible"
              : "opacity-0 invisible"
            }
          bottom-36 md:bottom-24`}
        >
          {!collapsed ? (
            <div className="fixed left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4 transition-[width,height,padding] duration-300">
              <div
                className={`bg-[#ebedf1] dark:bg-[#2a2a29] border border-black/10 dark:border-white/10 ${selectedField ? "rounded-b-2xl" : "rounded-2xl"
                  } overflow-visible relative`}
              >
                {/* Edit Section - Positioned absolutely above main bar */}
                <div
                  ref={inputSectionRef}
                  className={`absolute bottom-full left-0 right-0 bg-[#ebedf1] dark:bg-[#2a2a29] border-l border-r border-t border-black/10 dark:border-white/10 rounded-t-2xl transition-transform duration-100
                    ${selectedField
                      ? "opacity-100 visible translate-y-0 px-6 py-4"
                      : "opacity-0 invisible translate-y-4 px-6"
                    }`}
                >
                  <div
                    className={`flex items-center gap-4 flex-wrap lg:flex-nowrap ${selectedField ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    {/* Field Label */}
                    <div className="flex items-center gap-3 min-w-fit">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md">
                        {
                          fieldOptions.find((f) => f.key === selectedField)
                            ?.icon
                        }
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          Edit{" "}
                          {
                            fieldOptions.find((f) => f.key === selectedField)
                              ?.label
                          }
                        </span>
                      </div>
                    </div>

                    {/* Input Field */}
                    <div className="flex-1 min-w-[250px] max-w-lg">
                      {renderInlineInput()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 min-w-fit">
                      <Button
                        type="primary"
                        loading={loading}
                        disabled={!canApply()}
                        onClick={handleApplyUpdate}
                        size="small"
                        className="shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <CheckOutlined />
                        <span className="hidden sm:inline text-xs ml-1">
                          Apply Changes
                        </span>
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedField(null);
                          setFieldValue(null);
                        }}
                        icon={<CloseOutlined />}
                        danger
                        size="small"
                        className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
                {/* Main Action Bar */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4 w-full">
                    {/* Left Section - Selected Count & Info */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
                          {selectedCount}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold ">
                            {selectedCount}{" "}
                            {selectedCount === 1 ? "item" : "items"} selected
                          </span>
                          {totalCount && (
                            <span className="text-xs ">
                              of {totalCount} total
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Select Rows Multiple Select */}
                      {onSelectRows && allRecords && allRecords.length > 0 && (
                        <Select
                          mode="multiple"
                          placeholder="Select rows for bulk action"
                          value={selectedRowKeys.filter(
                            (key) => key !== "__SELECT_ALL__"
                          )} // Don't show SELECT_ALL in the selected values
                          onChange={(keys) => {
                            // If SELECT_ALL is in the new selection, select all records
                            if (keys.includes("__SELECT_ALL__" as any)) {
                              const allKeys = allRecords.map(
                                (record) => record.id
                              );
                              onSelectRows(allKeys);
                            } else {
                              // Filter out SELECT_ALL and use the rest
                              const filteredKeys = keys.filter(
                                (key) => key !== "__SELECT_ALL__"
                              );
                              onSelectRows(filteredKeys);
                            }
                          }}
                          style={{ minWidth: 200, maxWidth: 300 }}
                          size="small"
                          showSearch
                          maxTagCount={0}
                          maxTagPlaceholder={() => {
                            const totalSelected = selectedRowKeys.filter(
                              (key) => key !== "__SELECT_ALL__"
                            ).length;
                            return `+ ${totalSelected} row${totalSelected === 1 ? "" : "s"
                              }`;
                          }}
                          filterOption={(input, option) => {
                            // Don't filter the "Select All" option
                            if (option?.value === "__SELECT_ALL__") return true;
                            return (option?.label ?? "")
                              .toString()
                              .toLowerCase()
                              .includes(input.toLowerCase());
                          }}
                          options={[
                            // Select All option at the top
                            {
                              label:
                                selectedRowKeys.length === allRecords.length
                                  ? `Deselect All (${allRecords.length})`
                                  : `Select All (${allRecords.length})`,
                              value: "__SELECT_ALL__",
                            },
                            // Individual record options - tampilkan name/title/code di dropdown
                            ...allRecords.map((record, index) => ({
                              label:
                                (record as any).name ||
                                (record as any).title ||
                                (record as any).code ||
                                `Row ${index + 1}`,
                              value: record.id,
                            })),
                          ]}
                          onSelect={(value) => {
                            if (value === "__SELECT_ALL__") {
                              // Toggle: if all are selected, deselect all; otherwise select all
                              if (
                                selectedRowKeys.length === allRecords.length
                              ) {
                                onSelectRows([]);
                              } else {
                                onSelectRows(
                                  allRecords.map((record) => record.id)
                                );
                              }
                            }
                          }}
                        />
                      )}
                    </div>

                    {/* Center Section - Field Action Buttons */}
                    {/* Tombol Bulk Update */}
                    {onBulkUpdate !== undefined && !isFilterDeleted && (
                      <div className="flex-1 overflow-x-auto bulk-action-scroll max-w-2xl">
                        <div className="flex items-center gap-2 min-w-max px-1 py-1">
                          {fieldOptions.map((field) => (
                            <Button
                              key={field.key}
                              icon={field.icon}
                              onClick={() => handleFieldSelect(field.key)}
                              className={`flex items-center gap-2 border-0 transition-colors duration-200 whitespace-nowrap ${selectedField === field.key
                                ? "bg-blue-100 dark:bg-blue-900/30 !text-[#dc5b4d] !border-[#dc5b4d] dark:text-blue-300 shadow-md"
                                : "bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50"
                                }`}
                              size="small"
                            >
                              <span className="text-xs font-medium">
                                {field.label}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Tombol Restore */}
                    {onRestore !== undefined && isFilterDeleted && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Popconfirm
                          title="Restore data?"
                          description="Konfirmasi mengembalikan data ini?"
                          onConfirm={() =>
                            handleRestore(selectedRowKeys as number[])
                          }
                          okText="Ya, Restore"
                          cancelText="Batal"
                        >
                          <Button icon={<TbRestore />}>Restore</Button>
                        </Popconfirm>
                        <Popconfirm
                          title="Permanently delete data?"
                          description="Konfirmasi menghapus permanen data ini?"
                          onConfirm={() => onBulkDelete(true)}
                          okText="Ya, Delete"
                          cancelText="Batal"
                        >
                          <Button danger icon={<TbTrash />}>
                            Delete
                          </Button>
                        </Popconfirm>
                      </div>
                    )}

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Ganti Modal.confirm dengan Popconfirm */}
                      {useDelete && !isFilterDeleted && (
                        <Popconfirm
                          title="Konfirmasi Hapus"
                          description={`Konfirmasi menghapus ${selectedCount} item yang dipilih?`}
                          onConfirm={handleDeleteConfirm}
                          okText="Ya, Hapus"
                          cancelText="Batal"
                          okButtonProps={{ danger: true, loading: loading }}
                          placement="topRight"
                        >
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            className="transition-shadow duration-200 shadow-sm hover:shadow-md"
                            size="small"
                            title="Delete selected items"
                            disabled={loading}
                          >
                            <span className="hidden sm:inline text-xs">
                              Delete
                            </span>
                          </Button>
                        </Popconfirm>
                      )}

                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-lg"
                        size="small"
                        title="Clear selection"
                      />

                      <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => setCollapsed(true)}
                        size="small"
                        title="Collapse bar"
                      />
                    </div>
                  </div>
                </div>

                {/* Inline Edit Section */}
              </div>
            </div>
          ) : (
            <div className="fixed left-4 transition-[width,height,padding] duration-300">
              <div className="bg-[#ebedf1] dark:bg-[#2a2a29] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden px-6 py-4 flex items-center gap-2 shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-full">
                  {selectedCount}
                </div>

                <div className="flex flex-col min-w-[120px]">
                  <span className="text-sm font-semibold">
                    {selectedCount} {selectedCount === 1 ? "item" : "items"}{" "}
                    selected
                  </span>
                  {totalCount && (
                    <span className="text-xs">of {totalCount} total</span>
                  )}
                </div>

                <div className="flex items-center">
                  <Button
                    type="text"
                    icon={<RightOutlined />}
                    onClick={() => setCollapsed(false)}
                    size="small"
                    title="Expand actions"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    )
  );
}
