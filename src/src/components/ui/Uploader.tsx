"use client";
import { useFilesActions } from "@/features/files/hook/useFiles";
import { useState } from "react";
import { TbCloudUpload } from "react-icons/tb";
import Button from "./Button";
import { FileUploader } from "react-drag-drop-files";
import { CloseOutlined, FileExcelOutlined } from "@ant-design/icons";

interface UploaderProps {
  onChange?: (files: File[]) => void;
  onSubmit?: (data: any) => void;
}

export const FilesUploader = ({
  onChange = () => {},
  onSubmit = () => {},
}: UploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const { postFiles } = useFilesActions();
  const fileTypes = ["JPG", "JPEG", "PNG", "MP4", "PDF", "XLSX"];

  const handleUpload = async (files: File[]) => {
    const res = await postFiles(files);
    onSubmit(res);
    setFiles([]);
  };

  const handleChange = (newFiles: File | File[]) => {
    if (newFiles instanceof FileList) {
      setFiles((prev) => [...prev, ...newFiles]);
      onChange([...files, ...newFiles]);
    }
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    onChange(files.filter((_, i) => i !== index));
  };

  const renderPreview = (file: File) => {
    switch (file.type) {
      case "image/jpeg":
      case "image/png":
      case "image/jpg":
        return (
          <img
            className="w-20 h-20 object-cover"
            src={URL.createObjectURL(file)}
            alt={file.name}
          />
        );

      case "video/mp4":
        return (
          <video
            className="w-20 h-20"
            src={URL.createObjectURL(file)}
            controls
          />
        );

      case "application/pdf":
        return (
          <iframe className="w-1/2 h-20" src={URL.createObjectURL(file)} />
        );

      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return (
          <div className="w-20 h-20 flex items-center justify-center">
            <FileExcelOutlined className="text-4xl" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 rounded-2xl bg-white dark:bg-[#242424] w-full transition-all duration-300 group !border !border-black/10 dark:!border-white/10">
      <div className="bg-slate-100 dark:bg-[#1f1f1f] border-2 rounded-xl border-dashed border-gray-400 ">
        <FileUploader
          multiple
          classes="drop_zone"
          handleChange={handleChange}
          name="files"
          types={fileTypes}
          children={
            <div className="cursor-pointer p-8">
              <div className="items-center flex flex-col w-full ">
                <TbCloudUpload className="text-7xl text-gray-400 dark:text-[#8c8c8c]" />
                <div className="text-lg text-gray-400 dark:text-white/50">
                  Click or Drag Files to upload
                </div>
                <p className="text-gray-400 dark:text-white/50">
                  Allowed files: {fileTypes.join(", ")}
                </p>
              </div>
            </div>
          }
        />
        {files.length > 0 && (
          <>
            {/* <div className="w-full flex justify-center">
              <Button
                type="primary"
                className="mb-4"
                size="middle"
                disabled={files.length === 0}
                icon={<TbCloudUpload />}
                onClick={() => handleUpload(files)}
              >
                Upload
              </Button>
            </div> */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="px-8 py-4 space-y-2 overflow-y-scroll max-h-[500px]"
            >
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-4 bg-white dark:bg-[#2a2a2a]  border border-black/10 dark:border-white/10 p-2 rounded"
                >
                  <div className="flex items-center gap-4 ">
                    {renderPreview(file)}
                    <div className="">
                      <p>Nama: {file.name}</p>
                      <p>Tipe: {file.type}</p>
                      <p>Ukuran: {(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => handleRemove(index)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>{" "}
    </div>
  );
};
