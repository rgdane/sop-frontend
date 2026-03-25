"use client";
import { BaseRecord, EditableRecord } from "@/types/props/table.types";
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  CheckOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Popconfirm } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Button from "../Button";
import { useToast } from "@/components/providers/ToastProvider";
import { EditModal } from "../Modal/EditModal";
import { EditDrawer } from "../Drawer/EditDrawer";
import { InputTypeProps } from "@/types/props/input.type";
import { TbRestore, TbTrash } from "react-icons/tb";
import { CustomModal } from "@/components/ui/Modal/CustomModal";

interface TableActionsProps<T extends BaseRecord> {
  isFilterDeleted?: boolean;
  record: EditableRecord & T;
  title: string | React.ReactNode;
  columns: Array<{
    key: string;
    title: string;
    dataIndex?: string;
    editable?: boolean;
    inputType?: InputTypeProps;
    placeholder?: string;
    options?: Array<{ label: string; value: any }>;
  }>;
  useModal?: boolean;
  useDrawer?: boolean;
  useDelete?: boolean;
  useEdit?: boolean;
  isEditing: boolean;
  deleteConfirmTitle: string;
  setEditingIds: React.Dispatch<React.SetStateAction<number[]>>;
  setDataSource: React.Dispatch<
    React.SetStateAction<Array<EditableRecord & T>>
  >;
  onDelete: (
    record: EditableRecord & T,
    isPermanent?: boolean
  ) => Promise<void>;
  onUpdate: (id: number, data: Partial<T>) => Promise<void>;
  onDrawer: {
    open?: () => void;
    close?: () => void;
  };
  hideEdit?: boolean;
  hideDelete?: boolean;
  redirectPage?: string | null;
  onSaveNew?: (record: EditableRecord & T) => Promise<void>;
  redirectModule?: string;
  onRestore?: (record: EditableRecord & T) => Promise<void>;
  customModal?: any;
  onActions?: (record: EditableRecord & T) => void;
}

export function TableActions<T extends BaseRecord>({
  isFilterDeleted,
  record,
  title,
  isEditing,
  useModal = true,
  useDrawer = false,
  onDrawer,
  useEdit = true,
  useDelete = true,
  deleteConfirmTitle,
  setEditingIds,
  setDataSource,
  onDelete,
  columns,
  onUpdate,
  hideEdit = false,
  hideDelete = false,
  redirectPage,
  onSaveNew,
  redirectModule,
  onRestore,
  customModal,
  onActions = () => { }
}: TableActionsProps<T>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<
    (EditableRecord & T) | null
  >(null);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customContent, setCustomContent] = useState<React.ReactNode>(null);
  const router = useRouter();
  const [toast] = useToast();
  const variant = useDrawer ? "drawer" : useModal ? "modal" : null;

  const handleUpdate = () => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleSubmit = async (values: Partial<T>) => {
    try {
      await onUpdate(record.id, values);
      const updatedRecord = { ...record, ...values };
      setDataSource((prev) =>
        prev.map((row) => (row.tempId === record.tempId ? updatedRecord : row))
      );
      setEditingRecord(updatedRecord);
      setIsFormOpen(false);
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  const handleRestore = async () => {
    if (onRestore) {
      await onRestore(record);
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await onDelete(record, true);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (record.isNew) {
    return (
      <div className="flex gap-2">
        <Button
          type="primary"
          size="small"
          onClick={async () => {
            if (onSaveNew) {
              await onSaveNew(record);
            }
          }}
          icon={<CheckOutlined />}
          title="Save (Enter)"
          className="bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600"
        />
        <Button
          danger
          variant="dashed"
          size="small"
          onClick={() => {
            setDataSource((prev) =>
              prev.filter((item) => item.tempId !== record.tempId)
            );
            setEditingIds((prev) => prev.filter((id) => id !== record.tempId));
          }}
          icon={<CloseOutlined />}
          title="Cancel"
        />
      </div>
    );
  }

  const handleRedirect = () => {
    router.push(`${redirectPage}/${record?.id ?? record._elementId}`);
  };

  const renderVariant = () => {
    const rendered: React.ReactNode[] = [];

    switch (variant) {
      case "modal":
        rendered.push(
          <EditModal
            key="edit"
            open={isFormOpen && editingRecord?.id === record.id}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmit}
            record={record}
            columns={columns}
          />
        );
        break;
      case "drawer":
        rendered.push(
          <EditDrawer
            key="drawer"
            open={isFormOpen && editingRecord?.id === record.id}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmit}
            record={record}
            columns={columns}
            onDrawer={onDrawer}
          />
        );
        break;
    }

    return rendered;
  };

  return (
    <div className="">
      {!isFilterDeleted ? (
        <>
          <div className="flex gap-2">
            {redirectPage && (
              <Button
                redirectModule={redirectModule}
                onClick={handleRedirect}
                permission="view"
                icon={<EyeOutlined />}
              />
            )}
            {customModal && (
              <Button
                permission="create"
                onClick={() => {
                  setEditingRecord(record);
                  setCustomContent(customModal(record));
                  setIsCustomOpen(true);
                  onActions(record);
                }}
                icon={<InfoCircleOutlined />}
              />
            )}
            {!hideEdit && useEdit &&
              (variant ? (
                <Button
                  permission="update"
                  onClick={() => {
                    handleUpdate();
                    onActions(record);
                  }}
                  icon={<EditOutlined size={4} />}
                />
              ) : useEdit && (
                <Button
                  permission="update"
                  danger={isEditing}
                  onClick={() => {
                    setEditingIds((prev) =>
                      isEditing
                        ? prev.filter((id) => id !== record.tempId)
                        : [...prev, record.tempId]
                    );
                  }}
                  icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
                />
              ))}
            {!hideDelete && (
              <Popconfirm
                title={deleteConfirmTitle}
                onConfirm={() => {
                  if (record.users && record.users.length > 0)
                    return toast.error({
                      message: "Gagal menghapus squad",
                      description: "Kosongkan anggota terlebih dahulu",
                    });
                  onDelete(record);
                }}
                okText="Ya"
                cancelText="Batal"
              >
                {useDelete && (
                  <Button
                    danger
                    permission="delete"
                    icon={<DeleteOutlined />}
                  />
                )}
              </Popconfirm>
            )}
          </div>
          {!hideEdit && renderVariant()}
          {customModal && isCustomOpen && (
            <CustomModal
              record={record}
              open={isCustomOpen}
              onClose={() => setIsCustomOpen(false)}
              content={customContent}
            />
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Popconfirm
            title="Konfirmasi kembalikan data?"
            onConfirm={handleRestore}
            okText="Ya"
            cancelText="Batal"
          >
            <Button permission="update" icon={<TbRestore />} />
          </Popconfirm>
          <Popconfirm
            title="Konfirmasi hapus permanen data?"
            onConfirm={handlePermanentDelete}
            okText="Ya"
            cancelText="Batal"
          >
            <Button permission="delete" danger icon={<TbTrash />} />
          </Popconfirm>
        </div>
      )}
    </div>
  );
}
