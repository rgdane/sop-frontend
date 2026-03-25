"use client";
import React, { useCallback, useMemo } from "react";
import { Input, Select, Drawer, Divider, Row, Col, Radio } from "antd";
import { BaseRecord } from "@/types/props/table.types";
import { EditModalProps } from "@/types/props/modal.types";
import dayjs from "dayjs";
import { formatDateToIso } from "@/lib/formatDate";
import { formatColumns } from "@/lib/formatColumns";
import ColorPicker from "../ColorPicker";
import DatePicker from "../DatePicker";
import Button from "../Button";
import Form from "../Form";
import InputEditor from "@/components/fragments/editor/InputEditor";
import { CustomColumnProps } from "@/types/props/column.types";
import { PlusOutlined } from "@ant-design/icons";
import { callEvent } from "gantt";

const { RangePicker } = DatePicker;

interface EditDrawerProps<T extends BaseRecord> extends EditModalProps<T> {
  title?: string;
  width?: number | string;
  placement?: "top" | "right" | "bottom" | "left";
  onDrawer?: {
    open?: () => void;
    close?: () => void;
  };
}

function EditDrawer<T extends BaseRecord>({
  open,
  onClose,
  onSubmit,
  record,
  columns,
  title = "Edit Data",
  width = 600,
  placement = "right",
  onDrawer,
}: EditDrawerProps<T>) {
  const [form] = Form.useForm();
  const [currentFormValues, setCurrentFormValues] = React.useState<any>({});

  // Memoize the input field renderer to prevent re-creation
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
                    `getDynamicOptions returned non-array for ${col.dataIndex}:`,
                    dynamicOptions
                  );
                }
              } catch (error) {
                console.error(
                  `Error getting dynamic options for ${col.dataIndex}:`,
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

          const processedOptions =
            selectOptions?.map((opt, index) => ({
              ...opt,
              key: opt.value ?? opt.label ?? `option-${index}`,
            })) || [];
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
              options={processedOptions}
            />
          );
        case "radio":
          return (
            <Radio.Group
              options={col.options}
              // defaultValue={col.defaultValue}
              // block
              // optionType="button"
              // buttonStyle="solid"
            />
          );
        case "multiSelect":
          return (
            <Select
              mode="multiple"
              showSearch
              allowClear
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
                label: opt.label,
                value: opt.value ?? opt.label ?? `option-${idx}`,
              }))}
            />
          );
        case "color":
          return (
            <ColorPicker format="hex" size="large" style={{ width: "100%" }} />
          );
        default:
          return <Input placeholder={placeholder} />;
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

      if (col.inputType === "multiSelect" && Array.isArray(record[key])) {
        values[key] = (record[key] as any[])
          .map((item: any) => {
            if (typeof item === "object" && item && "id" in item) {
              return item.id;
            }
            if (typeof item === "object" && item && "value" in item) {
              return item.value;
            }
            return item;
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

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = await formatColumns(values, columns);
      onSubmit(formattedValues);
    } catch (err) {
      console.error("Validation failed:", err);
    }
  }, [form, columns, onSubmit]);

  // Memoize editable columns to prevent re-calculation
  const editableColumns = useMemo(
    () =>
      columns.filter(
        (col) => col.editable && col.dataIndex && !col.showInCreateOnly
      ),
    [columns]
  );

  return (
    <Drawer
      keyboard={false}
      title={title}
      placement={placement}
      width={width}
      onClose={onClose}
      open={open}
      maskClosable={false}
      styles={{
        body: {
          padding: 24,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "auto",
        },
      }}
    >
      {open && (
        <div className="h-full flex flex-col">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={handleValuesChange}
            className="flex-1"
          >
            <div className="flex-1 overflow-y-auto pb-4">
              <Row gutter={16}>
                {editableColumns.map((col) => {
                  const name = col.dataIndex!;
                  const isHidden =
                    typeof col.disabled === "function"
                      ? col.disabled(currentFormValues)
                      : col.disabled;
                  const label = col.getDynamicTitles
                    ? col.getDynamicTitles({ ...record, ...currentFormValues })
                    : col.title;

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

                  const isFullWidth =
                    col.inputWidth === "full" ||
                    col.inputType === "editor" ||
                    col.inputType === "multiselect";

                  return (
                    <Col key={name} xs={24} sm={isFullWidth ? 24 : 12}>
                      {!isHidden && (
                        <Form.Item label={label} name={name} rules={rules}>
                          {renderInputField(
                            col,
                            placeholder,
                            form,
                            currentFormValues,
                            record
                          )}
                        </Form.Item>
                      )}
                    </Col>
                  );
                })}
              </Row>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4">
              <Button
                onClick={(e) => {
                  onClose();
                  onDrawer?.close?.();
                }}
              >
                Batal
              </Button>
              <Button type="primary" htmlType="submit">
                Simpan
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Drawer>
  );
}

export { EditDrawer };
