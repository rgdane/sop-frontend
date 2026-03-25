import { Modal } from "antd";
import { useEffect, useState } from "react";


interface CustomModalProps {
  record?: Record<string, any>;
  open?: boolean;
  onClose?: any;
  content?: any;
}

export const CustomModal = ({ record, open, onClose, content }: CustomModalProps) => {
  useEffect(() => {
  }, [record]);

  if (!record) return null;

  return (
    <Modal
      open={open}
      closable
      onCancel={onClose}
      footer={null}
      title="Informasi Data"
    >
      <div className="space-y-3 pt-2">
        {content}
      </div>
    </Modal>
  );
};

export const renderModalInfo = (record?: Record<string, any>) => {
  if (!record) return null;
  return <CustomModal record={record} />;
};
