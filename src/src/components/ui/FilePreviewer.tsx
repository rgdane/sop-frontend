"use client";

import React from "react";
import {
  FilePdfOutlined,
  FileOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Button from "./Button";
import { Popconfirm } from "antd";

interface FilePreviewerProps {
  fileUrl: string;
  fileName: string;
  onDelete?: () => void;
  editable?: boolean;
}

const FilePreviewer: React.FC<FilePreviewerProps> = ({
  fileUrl,
  fileName,
  onDelete,
  editable = true,
}) => {
  const fileExt = fileName.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(
    fileExt || ""
  );
  const isPdf = fileExt === "pdf";

  return (
    <div className="relative w-32 border border-black/10! dark:border-white/10! rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-[#2e2e2e] group">
      {/* Delete Button (opsional) */}
      {onDelete && editable && (
        <div className="flex justify-end absolute top-1 left-1 z-10 w-full">
          <Popconfirm
            title="Apakah Anda yakin ingin menghapus file ini?"
            onConfirm={onDelete}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              className="absolute top-1 right-2 z-10 p-1 rounded-full bg-white text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-opacity"
              title="Hapus file"
            >
              <DeleteOutlined className="text-xs" />
            </Button>
          </Popconfirm>
        </div>
      )}

      {/* Preview Area */}
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-square relative bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        {isImage ? (
          <img
            src={fileUrl}
            alt={fileName}
            className="w-full h-full object-cover"
          />
        ) : isPdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-red-500">
            <FilePdfOutlined className="text-5xl" />
            <span className="mt-2 text-xs font-medium uppercase">PDF</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
            <FileOutlined className="text-5xl" />
            <span className="mt-2 text-xs font-medium uppercase">
              {fileExt}
            </span>
          </div>
        )}
      </a>
      <div className="p-2 border-t border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] ">
        <p
          className="text-xs truncate text-black dark:text-white"
          title={fileName}
        >
          {fileName.split("_").pop()}
        </p>
      </div>

      {/* File Info */}
    </div>
  );
};

export default FilePreviewer;
