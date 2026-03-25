"use client";

import React, { useState } from "react";
import { Popconfirm } from "antd";
import Button from "../Button";
import {
  PlusOutlined,
  SaveOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { CreateModal } from "../Modal/CreateModal";
import { ImportModal } from "../Modal/ImportModal";
import { InputTypeProps } from "@/types/props/input.type";
import { CreateDrawer } from "../Drawer/CreateDrawer";
import { BaseRecord } from "@/types/props/table.types";

type HeaderActionProps<T extends BaseRecord> = {
  title?: string;
  description?: string;
  addButtonText?: string;
  addGeneratorText?: string;
  onAdd: (values: Omit<T, "id">) => void;
  onSave: () => void;
  onGenerator?: {
    onGenerate: (data: any) => Promise<void>;
    title?: string;
  };
  onDrawer?: {
    open?: () => void;
    close?: () => void;
  };
  onChange?: any;
  selectedRowKeys: React.Key[];
  disableSave?: boolean;
  onBulkDelete: () => void;
  useGenerator: boolean;
  useHeaderAction?: boolean;
  defaultValues?: Partial<Omit<T, "id">>;
  useModal?: boolean;
  useDrawer?: boolean;
  columns: Array<{
    key: string;
    title: string;
    dataIndex?: string;
    editable?: boolean;
    inputType?: InputTypeProps;
    placeholder?: string;
    options?: Array<{ label: string; value: any }>;
  }>;
  autoSave?: boolean;
  onImport?: any;
};

export function HeaderAction<T extends BaseRecord>({
  addButtonText = "Tambah",
  addGeneratorText = "Generate",
  title,
  onAdd,
  onChange,
  onSave,
  onDrawer,
  onGenerator = { onGenerate: async () => { }, title: "Generate" },
  disableSave = false,
  useGenerator = false,
  useModal,
  useDrawer,
  useHeaderAction,
  defaultValues,
  columns,
  autoSave,
  onImport,
}: HeaderActionProps<T>) {

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const variant = useDrawer ? "drawer" : useModal ? "modal" : null;

  const handleCreate = () => {
    setIsFormOpen(true);
  };
  const handleImport = () => {
    setIsImportOpen(true);
  };

  const handleSubmit = async (values: Omit<T, "id">) => {
    try {
      await onAdd(values);
      setIsFormOpen(false);
    } catch (err) {
      throw err;
    }
  };
  const handleSubmitImport = async (values: string) => {
    try {
      await onImport(values);
      setIsImportOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const templateHeaders = columns
    .map((column) => {
      if (typeof column.dataIndex === "string") return column.dataIndex;
      if (typeof column.key === "string") return column.key;
      return null;
    })
    .filter(Boolean) as string[];

  const templateFileName = title ? String(title).replace(/\s+/g, "-").toLowerCase() : "template";

  const renderVariant = () => {
    const rendered: React.ReactNode[] = [];

    switch (variant) {
      case "modal":
        rendered.push(
          <CreateModal
            key="create"
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmit}
            columns={columns}
            defaultValues={defaultValues as Partial<T>}
          />
        );
        break;
      case "drawer":
        rendered.push(
          <CreateDrawer
            key="drawer"
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmit}
            onDrawer={onDrawer}
            columns={columns}
            onChange={onChange}
            defaultValues={defaultValues as Partial<T>}
          />
        );
        break;
    }

    rendered.push(
      <ImportModal
        key="import"
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSubmit={handleSubmitImport}
        templateHeaders={templateHeaders}
        templateFileName={templateFileName}
      />
    );

    return rendered;
  };

  if (!useHeaderAction) return;

  return (
    <div className="flex justify-between items-center gap-4">
      <div className="">{title && <h3 className="mt-2">{title}</h3>}</div>
      <div className="flex gap-x-4 py-2">
        {useHeaderAction && (useModal || useDrawer) && (
          <div className="flex items-center gap-x-2">
            <Button
              onClick={handleCreate}
              permission="create"
              type="primary"
              icon={<PlusOutlined />}
            >
              {addButtonText}
            </Button>
          </div>
        )}
        {onImport && (
          <div className="flex items-center gap-x-2">
            <Button
              onClick={handleImport}
              permission="create"
              type="primary"
              icon={<PlusOutlined />}
            >
              Import
            </Button>
          </div>
        )}
        {!autoSave && useHeaderAction && (
          <Button
            permission="save"
            disabled={disableSave}
            onClick={onSave}
            icon={<SaveOutlined />}
          >
            Save
          </Button>
        )}
        {useHeaderAction && useGenerator && (
          <Popconfirm
            title={"Anda yakin ingin generate data?"}
            onConfirm={onGenerator.onGenerate}
          >
            <Button permission="create" icon={<ThunderboltOutlined />}>
              {onGenerator.title ? onGenerator.title : addGeneratorText}
            </Button>
          </Popconfirm>
        )}
      </div>
      {renderVariant()}
    </div>
  );
}
