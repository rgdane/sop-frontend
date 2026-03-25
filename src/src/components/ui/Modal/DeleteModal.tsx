"use client";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface DeleteModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  content?: string;
  loading?: boolean;
}

export default function DeleteModal({
  isOpen,
  onCancel,
  onConfirm,
  title = "Konfirmasi Hapus",
  content = "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.",
  loading = false,
}: DeleteModalProps) {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-red-500" />
          {title}
        </div>
      }
      open={isOpen}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Hapus"
      cancelText="Batal"
      okType="danger"
      confirmLoading={loading}
      className="delete-modal"
    >
      <div className="py-4">
        <p className="text-gray-600 dark:text-gray-300">{content}</p>
      </div>
    </Modal>
  );
}
