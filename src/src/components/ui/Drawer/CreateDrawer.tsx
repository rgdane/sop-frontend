"use client";
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { Input, Select, Radio, Drawer, Row, Col, Divider } from "antd";
import { BaseRecord } from "@/types/props/table.types";
import { formatColumns } from "@/lib/formatColumns";
import DatePicker from "../DatePicker";
import ColorPicker from "../ColorPicker";
import Form from "../Form";
import Button from "../Button";
import InputEditor from "@/components/fragments/editor/InputEditor";
import { CustomColumnProps } from "@/types/props/column.types";
import { PlusOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

interface CreateDrawerProps<T> {
  onChange?: (changedValues: any, allValues: any) => void;
  open: boolean;
  onDrawer?: {
    open?: () => void;
    close?: () => void;
  };
  onClose: () => void;
  onSubmit: (data: Omit<T, "id">) => void;
  columns: any[];
  defaultValues?: Partial<T>;
}

export const CreateDrawer = <T extends BaseRecord>({
  open,
  onChange,
  onClose,
  onSubmit,
  columns,
  defaultValues,
  onDrawer = {},
}: CreateDrawerProps<T>) => {
  const [form] = Form.useForm();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFormValues, setCurrentFormValues] = useState<any>(
    defaultValues || {}
  );

  // 1. Gabungkan semua nilai default menjadi satu objek yang stabil
  const initialValues = useMemo(() => {
    const columnDefaults = columns.reduce((acc, col) => {
      if (col.dataIndex && col.defaultValue !== undefined) {
        acc[col.dataIndex] = col.defaultValue;
      }
      return acc;
    }, {} as Partial<T>);

    // Prioritaskan `defaultValues` dari props jika ada
    return { ...columnDefaults, ...defaultValues };
  }, [columns, defaultValues]);

  // 2. Gunakan `useEffect` untuk mengisi form saat drawer dibuka
  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      setCurrentFormValues(initialValues);
    }
  }, [open, initialValues, form]);

  const handleValuesChange = useCallback(
    (changedValues: any, allValues: any) => {
      setCurrentFormValues(allValues);

      Object.keys(changedValues).forEach((field) => {
        const col = columns.find((c) => c.dataIndex === field);
        if (col?.onFieldChange) {
          const mockRecord = { ...allValues };
          col.onFieldChange(field, changedValues[field], mockRecord);
        }
      });

      if (onChange) {
        onChange(changedValues, allValues);
      }
    },
    [columns, onChange]
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
case "editor":
          return <InputEditor outputFormat="json" />;
        case "select":
          let selectOptions = col.options || [];

          if (col.getDynamicOptions) {
            const mockRecord = { ...currentFormValues };
            selectOptions = col.getDynamicOptions(mockRecord as any) || [];
          }

          return (
            <Select
              showSearch
              disabled={
                typeof col.disabled === "function"
                  ? col.disabled(currentFormValues)
                  : col.disabled
              }
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
                          if (col.addDataOption) {
                            const mockRecord = { ...currentFormValues };
                            col.addDataOption(mockRecord);
                          }
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
        case "radio":
          return (
            <Radio.Group
              options={col.options}
              onChange={(e) => {
                col.onChange?.(e.target.value);
              }}
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
        case "color":
          return <ColorPicker style={{ width: "100%" }} />;
        default:
          return <Input placeholder={placeholder} />;
      }
    },
    [currentFormValues, form]
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = await formatColumns(values, columns);
      onSubmit(formattedValues as Omit<T, "id">);
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
    onDrawer.close?.();
  };

  const editableColumns = columns.filter(
    (col) => col.editable && col.dataIndex && !col.showInEditOnly
  );

  return (
    <Drawer
      open={open}
      keyboard={false}
      onClose={handleClose}
      width={isFullscreen ? "100vw" : 600}
      maskClosable={false}
      title="Tambah Data"
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
      <div className="h-full flex flex-col">
        {/*
          4. `initialValues` bisa ditambahkan di sini, tapi karena drawer
             tidak selalu unmount, `form.setFieldsValue` di `useEffect` lebih aman.
             Kita tetap menggunakan pendekatan `useEffect`.
        */}
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
                const label = col.getDynamicTitles
                  ? col.getDynamicTitles(currentFormValues)
                  : col.title;
                const placeholder = col.placeholder ?? "";
                const isHidden =
                  typeof col.disabled === "function"
                    ? col.disabled(currentFormValues)
                    : col.disabled;
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
                  col.inputType === "multiSelect";

                return (
                  <Col key={name} xs={24} sm={isFullWidth ? 24 : 12}>
                    {!isHidden && (
                      <Form.Item
                        label={label}
                        name={name}
                        rules={rules}
                        initialValue={col.defaultValue}
                      >
                        {renderInputField(col, placeholder)}
                      </Form.Item>
                    )}
                  </Col>
                );
              })}
            </Row>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4">
            <Button onClick={handleClose}>Batal</Button>
            <Button type="primary" htmlType="submit">
              Simpan
            </Button>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};
