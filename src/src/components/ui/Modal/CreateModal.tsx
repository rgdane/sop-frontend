"use client";
import React, { useEffect, useCallback, useState } from "react";
import { Input, Modal, Select, Divider, TreeSelect, Radio } from "antd";
import { BaseRecord } from "@/types/props/table.types";
import { CreateModalProps } from "@/types/props/modal.types";
import {
  ExpandOutlined,
  CompressOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { formatColumns } from "@/lib/formatColumns";
import DatePicker from "../DatePicker";
import ColorPicker from "../ColorPicker";
import Form from "../Form";
import Button from "../Button";
import InputEditor from "@/components/fragments/editor/InputEditor";
import { CustomColumnProps } from "@/types/props/column.types";

const { RangePicker } = DatePicker;

export function CreateModal<T extends BaseRecord>({
  open,
  onClose,
  onSubmit,
  columns,
  defaultValues,
  title = "Tambah Data",
  zIndex = 1000,
}: CreateModalProps<T> & { title?: string; zIndex?: number }) {
  const [form] = Form.useForm();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFormValues, setCurrentFormValues] = useState<any>({});

  useEffect(() => {
    if (open && defaultValues) {
      form.setFieldsValue(defaultValues);
      setCurrentFormValues(defaultValues);
    }
  }, [open, form]);

  // Stable callback for values change
  const handleValuesChange = useCallback(
    (changedValues: any, allValues: any) => {
      setCurrentFormValues(allValues);

      // Trigger onFieldChange for changed fields only
      Object.keys(changedValues).forEach((field) => {
        const col = columns.find((c) => c.dataIndex === field);
        if (col?.onFieldChange) {
          // Create mock record with current form values for onFieldChange
          const mockRecord = { ...allValues };
          col.onFieldChange(field, changedValues[field], mockRecord);
        }
      });
    },
    [columns]
  );

  const renderInputField = useCallback(
    (col: CustomColumnProps<T>, placeholder: string): React.ReactNode => {
      switch (col.inputType) {
        case "number":
          return <Input type="number" placeholder={placeholder} />;
        case "date":
          return <DatePicker style={{ width: "100%" }} />;
        case "dateRange":
          return (
            <RangePicker
              style={{ width: "100%" }}
              placeholder={["Tanggal Mulai", "Tanggal Selesai"]}
            />
          );
        case "radio":
          return (
            <Radio.Group
              options={col.options}
              onChange={(e) => {
                form.setFieldsValue({ [col.dataIndex!]: e.target.value });
                setCurrentFormValues((prev: any) => ({
                  ...prev,
                  [col.dataIndex!]: e.target.value,
                }));
                if (col.onFieldChange) {
                  const mockRecord = { ...currentFormValues, [col.dataIndex!]: e.target.value };
                  col.onFieldChange(col.dataIndex!, e.target.value, mockRecord);
                }
              }}
            />
          )
case "editor":
          return <InputEditor outputFormat="json" />;
        case "select":
          // Calculate select options
          let selectOptions = col.options || [];

          // Dynamic options based on dependencies
          if (col.dependencies?.length && currentFormValues) {
            const dependencyKey = col.dependencies[0];
            const dependencyValue = currentFormValues[dependencyKey];

            // Use getDynamicOptions if available
            if (dependencyValue && col.getDynamicOptions) {
              try {
                // Create mock record with current form values
                const mockRecord = { ...currentFormValues };
                const dynamicOptions = col.getDynamicOptions(mockRecord as any);
                if (Array.isArray(dynamicOptions)) {
                  selectOptions = dynamicOptions;
                } else {
                  console.warn(
                    `getDynamicOptions returned non-array for create modal ${col.dataIndex}:`,
                    dynamicOptions
                  );
                }
              } catch (error) {
                console.error(
                  `Error getting dynamic options for create modal ${col.dataIndex}:`,
                  error
                );
                selectOptions = col.options || [];
              }
            }

            // Use dynamicOptions if available (legacy support)
            if (
              dependencyValue &&
              col.dynamicOptions &&
              !col.getDynamicOptions
            ) {
              selectOptions = col.dynamicOptions[dependencyValue] || [];
            }
          }

          return (
            <Select
              showSearch
              onSearch={(value) => col.onSearch && col.onSearch(value)}
              disabled={
                typeof col.disabled === "function"
                  ? col.disabled(currentFormValues)
                  : col.disabled
              }
              value={currentFormValues?.[col.dataIndex!]}
              onChange={(value) => {
                if (col.onChange) {
                  col.onChange(value, form);
                }

                if (col.onFieldChange) {
                  const mockRecord = {
                    ...currentFormValues,
                    [col.dataIndex!]: value,
                  };
                  col.onFieldChange(col.dataIndex!, value, mockRecord);
                }

                // Update current form values immediately
                setCurrentFormValues((prev: any) => ({
                  ...prev,
                  [col.dataIndex!]: value,
                }));
              }}
              placeholder={placeholder}
              allowClear
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              popupRender={(menu) => (
                <>
                  <div>{menu}</div>
                  {col.addDataOption && (
                    <>
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="text"
                        className="w-full"
                        onClick={() => {
                          const mergedRecord = {
                            ...currentFormValues,
                          };
                          col.addDataOption?.(mergedRecord);
                        }}
                        icon={<PlusOutlined />}
                      >
                        Tambah Data
                      </Button>
                    </>
                  )}
                </>
              )}
              options={selectOptions?.map((opt, index) => ({
                ...opt,
                key: opt.value ?? opt.label ?? `option-${index}`,
              }))}
            />
          );
        case "multiSelect":
          return (
            <Select
              placeholder={placeholder}
              mode="multiple"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={(value) => {
                if (col.onChange) {
                  col.onChange(value, form);
                }
              }}
              popupRender={(menu) => (
                <>
                  <div>{menu}</div>
                  {col.addDataOption && (
                    <>
                      <Divider style={{ margin: "8px 0" }} />
                      <Button
                        type="text"
                        className="w-full"
                        onClick={col.addDataOption}
                        icon={<PlusOutlined />}
                      >
                        Tambah Data
                      </Button>
                    </>
                  )}
                </>
              )}
              options={col.options?.map((opt, idx) => ({
                label: opt.label,
                value: opt.value ?? opt.label ?? `option-${idx}`,
              }))}
            />
          );
        case "treeSelect":
          const treeValue = currentFormValues?.[col.dataIndex!] || undefined;
          const treeOptions = col.options || [];
          return (
            <TreeSelect
              style={{ width: "100%" }}
              value={treeValue}
              treeData={treeOptions}
              onChange={(val) => {
                form.setFieldsValue({ [col.dataIndex!]: val });
                setCurrentFormValues((prev: any) => ({
                  ...prev,
                  [col.dataIndex!]: val,
                }));
                if (col.onFieldChange) {
                  const mockRecord = {
                    ...currentFormValues,
                    [col.dataIndex!]: val,
                  };
                  col.onFieldChange(col.dataIndex!, val, mockRecord);
                }
              }}
              treeCheckable
              showSearch
              allowClear
              showCheckedStrategy={TreeSelect.SHOW_CHILD}
              placeholder={col.placeholder || "Silakan pilih"}
              treeDefaultExpandAll
              filterTreeNode={(input, treeNode) =>
                (treeNode?.title ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          );
        case "color":
          return (
            <ColorPicker
              format="hex"
              style={{ width: "100%" }}
              onChange={(color) => {
                const hexValue = color.toHexString();
                form.setFieldsValue({ [col.dataIndex!]: hexValue });
                setCurrentFormValues((prev: any) => ({
                  ...prev,
                  [col.dataIndex!]: hexValue,
                }));
                if (col.onFieldChange) {
                  const mockRecord = { ...currentFormValues, [col.dataIndex!]: hexValue };
                  col.onFieldChange(col.dataIndex!, hexValue, mockRecord);
                }
              }}
              value={currentFormValues?.[col.dataIndex!] ?? "#000000"}
            />
          );
        case "custom":
          if (col.renderInput) {
            const fieldValue = currentFormValues?.[col.dataIndex!];
            return col.renderInput(fieldValue, currentFormValues as T, form);
          }
        default:
          return (
            <Input placeholder={placeholder} readOnly={col.disabled || false} />
          );
      }
    },
    [currentFormValues, form]
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = await formatColumns(values, columns);
      await onSubmit(formattedValues as Omit<T, "id">);
      form.resetFields();
      setCurrentFormValues({});
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setCurrentFormValues({});
    setIsFullscreen(false);
    onClose();
  };

  const editableColumns = columns.filter(
    (col) => col.editable && col.dataIndex && !col.showInEditOnly
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      maskClosable={false}
      closable={false}
      footer={null}
      zIndex={zIndex}
      title={
        <div className="flex justify-between items-center">
          <span>{title}</span>
          <Button
            type="text"
            icon={!isFullscreen ? <ExpandOutlined /> : <CompressOutlined />}
            onClick={() => setIsFullscreen((prev) => !prev)}
          />
        </div>
      }
      styles={{
        content: isFullscreen
          ? {
            padding: 50,
            width: "100vw",
            maxWidth: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            borderRadius: 0,
          }
          : {
            padding: 24,
            maxWidth: "100vw",
            width: "100%",
            borderRadius: 8,
          },
        body: {
          flex: 1,
          overflowY: "auto",
          padding: 24,
        },
      }}
      style={isFullscreen ? { top: 0, left: 0, margin: 0, padding: 0 } : {}}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        {editableColumns.map((col) => {
          const name = col.dataIndex!;
          const label = col.title;
          const placeholder = col.placeholder ?? "";

          const rules =
            col.rules?.map((rule: any) => {
              if (rule.required && !rule.message) {
                return {
                  ...rule,
                  message: `${label} tidak boleh kosong`,
                };
              }
              return rule;
            }) ?? [];

          return (
            <Form.Item key={name} label={label} name={name} rules={rules}>
              {renderInputField(col, placeholder)}
            </Form.Item>
          );
        })}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleClose}>Batal</Button>
          <Button type="primary" htmlType="submit">
            Simpan
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
