"use client";
import React, { useCallback, useMemo, useState } from "react";
import { Modal, Input, Select, Divider, TreeSelect, Radio, TimePicker } from "antd";
import { BaseRecord } from "@/types/props/table.types";
import { EditModalProps } from "@/types/props/modal.types";
import {
  CompressOutlined,
  ExpandOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { formatDateToIso } from "@/lib/formatDate";
import { formatColumns } from "@/lib/formatColumns";
import ColorPicker from "../ColorPicker";
import DatePicker from "../DatePicker";
import Button from "../Button";
import Form from "../Form";
import { CustomColumnProps } from "@/types/props/column.types";
import InputEditor from "@/components/fragments/editor/InputEditor";

const { RangePicker } = DatePicker;

export function EditModal<T extends BaseRecord>({
  open,
  onClose,
  onSubmit,
  record,
  columns,
}: EditModalProps<T>) {
  const [form] = Form.useForm();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFormValues, setCurrentFormValues] = useState<any>({});

  const renderInputField = useCallback(
    (
      col: CustomColumnProps<T>,
      placeholder: string,
      formInstance?: any,
      currentValues?: any,
      record?: T
    ): React.ReactNode => {
      switch (col.inputType) {
        case "number":
          return <Input type="number" placeholder={placeholder} />;
        case "date":
          return (
            <DatePicker
              onChange={(date: any) => formatDateToIso(date)}
              style={{ width: "100%" }}
            />
          );
        case "dateRange":
          return (
            <RangePicker
              format="DD-MM-YYYY"
              style={{ width: "100%" }}
              placeholder={["Tanggal Mulai", "Tanggal Selesai"]}
            />
          );
        case "time":
          return (
            <TimePicker.RangePicker
              format="HH:mm"
              style={{ width: "100%" }}
              placeholder={["Jam Mulai", "Jam Selesai"]}
            />
          );
case "editor":
          return <InputEditor outputFormat="json" />;
        case "select":
          let selectOptions = col.options || [];

          if (col.dependencies?.length && currentValues) {
            const dependencyKey = col.dependencies[0];
            const dependencyValue = currentValues[dependencyKey];

            if (dependencyValue && col.getDynamicOptions) {
              try {
                const mockRecord = { ...record, ...currentValues };
                const dynamicOptions = col.getDynamicOptions(mockRecord as any);
                if (Array.isArray(dynamicOptions)) {
                  selectOptions = dynamicOptions;
                } else {
                  console.warn(
                    `getDynamicOptions returned non-array for edit modal ${col.dataIndex}:`,
                    dynamicOptions
                  );
                }
              } catch (error) {
                console.error(
                  `Error getting dynamic options for edit modal ${col.dataIndex}:`,
                  error
                );
                selectOptions = col.options || [];
              }
            }

            if (
              dependencyValue &&
              col.dynamicOptions &&
              !col.getDynamicOptions
            ) {
              selectOptions = col.dynamicOptions[dependencyValue] || [];
            }
          } else if (col.getDynamicOptions && record) {
            try {
              const dynamicOptions = col.getDynamicOptions(record as any);
              if (Array.isArray(dynamicOptions)) {
                selectOptions = dynamicOptions;
              }
            } catch (error) {
              console.error("Error getting dynamic options:", error);
              selectOptions = col.options || [];
            }
          }

          return (
            <Select
              showSearch
              disabled={
                typeof col.disabled === "function"
                  ? col.disabled(currentFormValues)
                  : col.disabled
              }
              value={currentValues?.[col.dataIndex!]}
              onChange={(value) => {
                if (col.onChange) {
                  col.onChange(value, formInstance);
                }

                if (col.onFieldChange && record) {
                  col.onFieldChange(col.dataIndex!, value, record as any);
                }

                setCurrentFormValues((prev: any) => ({
                  ...prev,
                  [col.dataIndex!]: value,
                }));
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              placeholder={placeholder}
              allowClear
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
              mode="multiple"
              showSearch
              allowClear
              labelInValue
              style={{ width: "100%" }}
              placeholder={placeholder}
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
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={col.options?.map((opt, idx) => ({
                label: opt.label || "-",
                value: opt?.value ?? opt?.label ?? `option-${idx}`,
              }))}
            />
          );
        case "treeSelect":
          const treeData = (col.options || []).map((node) => ({
            ...node,
            value: node.value?.toString(),
            children: node.children?.map((child: any) => ({
              ...child,
              value: child.value?.toString(),
            })),
          }));

          const selectedValues =
            currentValues?.[col.dataIndex!] instanceof Array
              ? currentValues[col.dataIndex!].map((v: any) => v?.toString())
              : [];

          return (
            <TreeSelect
              treeCheckable
              showCheckedStrategy={TreeSelect.SHOW_CHILD}
              treeDefaultExpandAll
              allowClear
              placeholder={placeholder}
              value={selectedValues}
              onChange={(val) => {
                form.setFieldsValue({ [col.dataIndex!]: val });
                setCurrentFormValues((prev: any) => ({
                  ...prev,
                  [col.dataIndex!]: val,
                }));
                if (col.onFieldChange) {
                  const mockRecord = { ...currentFormValues, [col.dataIndex!]: val };
                  col.onFieldChange(col.dataIndex!, val, mockRecord);
                }
              }}
              treeData={treeData}
              style={{ width: "100%" }}
            />
          );
        case "color":
          return (
            <ColorPicker
              format="hex"
              size="large"
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
              value={currentValues?.[col.dataIndex!] ?? "#000000"}
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
        case "custom":
          if (col.renderInput && col.dataIndex) {
            const originalValue = formInstance.getFieldValue(col.dataIndex);
            let valueToUse = originalValue;

            if (col.dataIndex.toLowerCase().includes("password")) {
              formInstance.setFieldsValue({ [col.dataIndex]: "" });
              valueToUse = "";
            }

            return col.renderInput(valueToUse, record as T, form);
          }
        default:
          return (
            <Input placeholder={placeholder} readOnly={col.disabled || false} />
          );
      }
    },
    [currentFormValues]
  );

  const initialValues = useMemo(() => {
    if (!open || !record || Object.keys(record).length === 0) {
      return {};
    }

    const values: Record<string, any> = { ...record };

    columns.forEach((col) => {
      const key = col.dataIndex!;

      if (col.inputType === "date" && record[key]) {
        values[key] = dayjs(record[key]);
      }

      if (col.inputType === "dateRange") {
        if (key === "date_range") {
          const startDate = record["start_date"];
          const endDate = record["end_date"];
          if (
            startDate &&
            endDate &&
            startDate !== "1070-01-01" &&
            endDate !== "1070-01-01"
          ) {
            values[key] = [dayjs(startDate), dayjs(endDate)];
          } else if (startDate && startDate !== "1070-01-01") {
            values[key] = [dayjs(startDate), null];
          } else if (endDate && endDate !== "1070-01-01") {
            values[key] = [null, dayjs(endDate)];
          } else {
            values[key] = null;
          }
        }
      }

      if (col.inputType === "time" && record[key]) {
        const timeValue = record[key];
        if (typeof timeValue === 'string') {
          const match = timeValue.match(/(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})/);
          if (match) {
            values[key] = [
              dayjs().hour(parseInt(match[1])).minute(parseInt(match[2])),
              dayjs().hour(parseInt(match[3])).minute(parseInt(match[4]))
            ];
          }
        }
      }

      if (col.inputType === "multiSelect" && Array.isArray(record[key])) {
        values[key] = (record[key] as any[])
          .map((item: any) => {
            if (typeof item === "object" && item) {
              return {
                label: item.label || item.name || item.id,
                value: item.id ?? item.value,
              };
            }
            return { label: item, value: item };
          })
          .filter(Boolean);
      }

      if (col.inputType === "treeSelect" && Array.isArray(record[key])) {
        values[key] = record[key]
          .map((item: any) => {
            if (typeof item === "object" && item) {
              return item.id?.toString() ?? item.value?.toString();
            }
            return item?.toString();
          })
          .filter(Boolean);
      }
    });

    return values;
  }, [open, record, columns]);

  React.useEffect(() => {
    if (open && Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
      setCurrentFormValues(initialValues);
    }
  }, [open]);

  const handleValuesChange = useCallback(
    (changedValues: any, allValues: any) => {
      setCurrentFormValues(allValues);

      if (changedValues && record) {
        Object.keys(changedValues).forEach((field) => {
          const col = columns.find((c) => c.dataIndex === field);
          if (col?.onFieldChange) {
            col.onFieldChange(field, changedValues[field], record as any);
          }
        });
      }
    },
    [record, columns]
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = await formatColumns(values, columns);
      onSubmit(formattedValues);
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const handleClose = () => {
    setIsFullscreen(false);
    onClose();
  };

  // Memoize editable columns to prevent re-calculation
  const editableColumns = useMemo(
    () =>
      columns.filter(
        (col) => col.editable && col.dataIndex && !col.showInCreateOnly
      ),
    [columns]
  );

  return (
    <Modal
      open={open}
      closable={false}
      maskClosable={false}
      onCancel={handleClose}
      afterClose={() => setIsFullscreen(false)}
      footer={null}
      title={
        <div className="flex justify-between items-center">
          <span>Edit Data</span>
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
      {open && (
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
                {renderInputField(
                  col,
                  placeholder,
                  form,
                  currentFormValues,
                  record
                )}
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
      )}
    </Modal>
  );
}
