"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Input, Modal, Tabs } from "antd";
import { BaseRecord } from "@/types/props/table.types";
import { ImportModalProps } from "@/types/props/modal.types";
import {
  ExpandOutlined,
  CompressOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import Form from "../Form";
import Button from "../Button";

export function ImportModal<T extends BaseRecord>({
  open,
  onClose,
  onSubmit,
  title = "Import Data",
  zIndex = 1000,
  templateHeaders = [],
  templateFileName = "template",
}: Omit<ImportModalProps<T>, "columns" | "defaultValues"> & {
  title?: string;
  zIndex?: number;
}) {
  const [form] = Form.useForm();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentValue, setCurrentValue] = useState("");
  const [activeTab, setActiveTab] = useState("json");

  useEffect(() => {
    if (open) {
      form.resetFields();
      setCurrentValue("");
    }
  }, [open, form]);

  const handleValuesChange = useCallback(
    (_: any, allValues: any) => {
      if (activeTab === "json") {
        setCurrentValue(allValues.jsonField || "");
      } else {
        setCurrentValue(allValues.csvField || "");
      }
    },
    [activeTab]
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit((activeTab === "json" ? values.jsonField : values.csvField) as any);
      form.resetFields();
      setCurrentValue("");
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setCurrentValue("");
    setIsFullscreen(false);
    onClose();
  };

  const buildCsvTemplate = () => {
    if (templateHeaders.length === 0) return "";
    const headerLine = templateHeaders.join(",");
    return `${headerLine}\n`;
  };

  const buildJsonExample = () => {
    if (templateHeaders.length === 0) {
      return "[\n  {\n    \"field\": \"value\"\n  }\n]";
    }

    const exampleItem = Object.fromEntries(
      templateHeaders.map((header) => [header, ""])
    );
    return JSON.stringify([exampleItem], null, 2);
  };

  const handleCopyExample = async () => {
    const example = buildJsonExample();
    try {
      await navigator.clipboard.writeText(example);
    } catch (error) {
      console.error("Failed to copy example:", error);
    }
  };

  const handleCopyCsvExample = async () => {
    const example = buildCsvTemplate();
    try {
      await navigator.clipboard.writeText(example);
    } catch (error) {
      console.error("Failed to copy CSV example:", error);
    }
  };

  const handleDownloadTemplate = async () => {
    if (templateHeaders.length === 0) return;
    try {
      const { Workbook } = await import("exceljs");
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Template");
      worksheet.addRow(templateHeaders);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${templateFileName}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to build XLSX template:", error);
      const csvContent = buildCsvTemplate();
      if (!csvContent) return;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${templateFileName}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleXlsxUpload = async (file: File) => {
    try {
      const { Workbook } = await import("exceljs");
      const workbook = new Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];
      if (!worksheet) return;

      const rows: string[] = [];
      worksheet.eachRow({ includeEmpty: true }, (row) => {
        const values = Array.isArray(row.values) ? row.values.slice(1) : [];
        const csvLine = values
          .map((value) => {
            if (value === null || value === undefined) return "";
            const text = String(value).replace(/"/g, '""');
            return /[",\n]/.test(text) ? `"${text}"` : text;
          })
          .join(",");
        rows.push(csvLine);
      });

      const csv = rows.join("\n");
      form.setFieldsValue({ csvField: csv });
      setCurrentValue(csv || "");
      setActiveTab("csv");
    } catch (error) {
      console.error("Failed to parse XLSX:", error);
    }
  };

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
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "json",
              label: "JSON",
              children: (
                <div className="space-y-3">
                  <Form.Item
                    label="JSON Text"
                    name="jsonField"
                    rules={[{ required: activeTab === "json", message: "JSON Text tidak boleh kosong" }]}
                  >
                    <Input.TextArea
                      placeholder="Masukkan JSON Text..."
                      rows={5}
                    />
                  </Form.Item>
                  <div className="rounded-md border border-gray-200 dark:border-white/10 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Format JSON
                      </span>
                      <Button size="small" type="default" onClick={handleCopyExample}>
                        Copy
                      </Button>
                    </div>
                    <pre className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                      {buildJsonExample()}
                    </pre>
                  </div>
                </div>
              ),
            },
            {
              key: "xlsx",
              label: "XLSX",
              children: (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) handleXlsxUpload(file);
                      }}
                    />
                    <Button type="default" icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                      Template
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    File akan di-convert ke CSV sebelum diproses.
                  </div>
                </div>
              ),
            },
            {
              key: "csv",
              label: "CSV",
              children: (
                <div className="space-y-3">
                  <Form.Item
                    label="CSV Text"
                    name="csvField"
                    rules={[{ required: activeTab === "csv", message: "CSV Text tidak boleh kosong" }]}
                  >
                    <Input.TextArea
                      placeholder="Masukkan CSV Text..."
                      rows={10}
                    />
                  </Form.Item>
                  <div className="rounded-md border border-gray-200 dark:border-white/10 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Contoh format CSV
                      </span>
                      <Button size="small" type="default" onClick={handleCopyCsvExample}>
                        Copy
                      </Button>
                    </div>
                    <pre className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
{buildCsvTemplate() || "field,field2"}
                    </pre>
                  </div>
                </div>
              ),
            },
          ]}
        />

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
