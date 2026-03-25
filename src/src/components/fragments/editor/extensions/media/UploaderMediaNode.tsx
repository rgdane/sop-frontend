"use client";
import { NodeViewWrapper } from "@tiptap/react";
import { useFilesActions } from "@/features/files/hook/useFiles";
import { useState, useTransition, useRef, useEffect } from "react";
import { TbCloudUpload } from "react-icons/tb";
import { FileUploader } from "react-drag-drop-files";
import { CloseOutlined, FileExcelOutlined } from "@ant-design/icons";
import Button from "@/components/ui/Button";
// import { ImageMediaNodeView } from "./ImageMediaNode";

interface MediaProps {
  node: any;
  updateAttributes: (attrs: Record<string, any>) => void;
  selected?: boolean;
}

export const UploaderMediaNodeView = ({
  node,
  updateAttributes,
  selected,
}: MediaProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || 600,
    height: node.attrs.height || 400,
  });

  const { postFiles } = useFilesActions();
  const imgRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const fileTypes = ["JPG", "JPEG", "PNG"];

  const isImage =
    node.attrs.mime?.startsWith("image/") ||
    node.attrs.mime === "image/jpeg" ||
    node.attrs.mime === "image/png" ||
    node.attrs.mime === "image/jpg";

  // Load natural dimensions when image loads
  useEffect(() => {
    if (isImage && node.attrs.src && !node.attrs.uploading && imgRef.current) {
      const img = imgRef.current;

      const handleLoad = () => {
        if (!node.attrs.width && !node.attrs.height) {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          const maxWidth = 600;
          const width = Math.min(img.naturalWidth, maxWidth);
          const height = width / aspectRatio;

          setDimensions({ width, height });
          queueMicrotask(() => {
            updateAttributes({
              width,
              height,
              aspectRatio,
            });
          });
        } else {
          setDimensions({
            width: node.attrs.width || img.naturalWidth,
            height: node.attrs.height || img.naturalHeight,
          });
        }
      };

      if (img.complete) {
        handleLoad();
      } else {
        img.addEventListener("load", handleLoad);
        return () => img.removeEventListener("load", handleLoad);
      }
    }
  }, [node.attrs.src, node.attrs.uploading]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
    };

    let currentDimensions = {
      width: dimensions.width,
      height: dimensions.height,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      let newWidth = Math.max(100, startPos.current.width + deltaX);
      let newHeight = startPos.current.height;

      // Maintain aspect ratio
      if (node.attrs.aspectRatio) {
        newHeight = newWidth / node.attrs.aspectRatio;
      }

      currentDimensions = { width: newWidth, height: newHeight };
      setDimensions(currentDimensions);
    };

    const handleMouseUp = () => {
      setIsResizing(false);

      // Use the latest dimensions from closure
      queueMicrotask(() => {
        updateAttributes({
          width: Math.round(currentDimensions.width),
          height: Math.round(currentDimensions.height),
        });
      });

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleUpload = async (uploadFiles: File[]) => {
    queueMicrotask(() => {
      updateAttributes({ uploading: true, progress: 0 });
    });

    const res = await postFiles(uploadFiles, (percent) => {
      queueMicrotask(() => {
        updateAttributes({ progress: percent });
      });
    });

    queueMicrotask(() => {
      updateAttributes({
        src: res?.url ?? null,
        uploading: false,
        progress: 100,
        mime: uploadFiles[0]?.type,
        name: uploadFiles[0]?.name,
        size: uploadFiles[0]?.size,
      });
    });

    startTransition(() => {
      setFiles([]);
    });
  };

  const handleChange = (newFiles: File | File[]) => {
    startTransition(() => {
      if (newFiles instanceof FileList) {
        setFiles((prev) => [...prev, ...newFiles]);
      }
    });
  };

  const handleRemove = (index: number) => {
    startTransition(() => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    });
  };

  const renderPreview = (file: File) => {
    switch (file.type) {
      case "image/jpeg":
      case "image/png":
      case "image/jpg":
        return (
          <img
            className="w-20 h-20 object-cover rounded"
            src={URL.createObjectURL(file)}
            alt={file.name}
          />
        );

      case "video/mp4":
        return (
          <video
            className="w-20 h-20 rounded"
            src={URL.createObjectURL(file)}
            controls
          />
        );

      case "application/pdf":
        return (
          <iframe
            className="w-32 h-32 rounded border"
            src={URL.createObjectURL(file)}
          />
        );

      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return (
          <div className="w-20 h-20 flex items-center justify-center bg-green-50 dark:bg-green-900/30 rounded">
            <FileExcelOutlined className="text-4xl text-green-600 dark:text-green-300" />
          </div>
        );

      default:
        return (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-xs text-gray-500">No preview</span>
          </div>
        );
    }
  };

  const renderUploadedFile = () => {
    const { src, mime, name, size } = node.attrs;
    if (!src) return null;

    switch (true) {
      case mime?.startsWith("image/"):
        return (
          <div
            className={`relative inline-block rounded ${selected ? "ring-2 ring-blue-500 ring-offset-1" : ""
              } ${isResizing ? "select-none" : ""}`}
            style={{ width: `${dimensions.width}px` }}
          >
            <img
              ref={imgRef}
              className="max-w-full rounded block"
              src={src}
              alt={name}
              style={{
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
              }}
            />

            {selected && !isResizing && (
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize hover:bg-blue-600 hover:scale-110 transition-all shadow-lg"
                onMouseDown={handleMouseDown}
              />
            )}
          </div>
        );

      case mime === "video/mp4":
        return <video className="max-w-full rounded" src={src} controls />;

      case mime === "application/pdf":
        return (
          <iframe
            className="w-full h-96 rounded border"
            src={src}
            title={name}
          />
        );

      case mime?.includes("spreadsheet"):
        return (
          <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/30 rounded">
            <FileExcelOutlined className="text-2xl text-green-600 dark:text-green-300" />
            <span>
              {name} ({(size / 1024).toFixed(2)} KB)
            </span>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
            <span>{name}</span>
          </div>
        );
    }
  };

  if (node.attrs.src && !node.attrs.uploading) {
    return (
      <NodeViewWrapper className="">{renderUploadedFile()}</NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      data-id={node.attrs.id}
      className="p-8 rounded-2xl bg-white dark:bg-[#242424] w-full transition-all duration-300 border border-black/10 dark:border-white/10"
    >
      <div className="bg-slate-100 dark:bg-[#1f1f1f] border-2 rounded-xl border-dashed border-gray-400">
        <FileUploader
          multiple
          classes="drop_zone"
          handleChange={handleChange}
          name="files"
          types={fileTypes}
        >
          <div className="cursor-pointer p-8">
            <div className="items-center flex flex-col w-full">
              <TbCloudUpload className="text-7xl text-gray-400 dark:text-[#8c8c8c]" />
              <div className="text-lg text-gray-400 dark:text-white/50">
                Click or Drag Files to upload
              </div>
              <p className="text-gray-400 dark:text-white/50">
                Allowed files: {fileTypes.join(", ")}
              </p>
            </div>
          </div>
        </FileUploader>

        {files.length > 0 && (
          <>
            <div className="w-full">
              <div className="flex justify-center">
                <Button
                  type="primary"
                  className="mb-4"
                  size="middle"
                  disabled={files.length === 0 || isPending}
                  icon={<TbCloudUpload />}
                  onClick={() => handleUpload(files)}
                >
                  Upload
                </Button>
              </div>
              {node.attrs.progress != 0 && (
                <div className="px-8 mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
                    <div
                      className="bg-blue-500 h-2 rounded transition-all"
                      style={{ width: `${node.attrs.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {node.attrs.progress || 0}%
                  </p>
                </div>
              )}
            </div>
            <div className="px-8 py-4 space-y-2 overflow-y-scroll max-h-[500px]">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-4 bg-white dark:bg-[#2a2a2a] border border-black/10 dark:border-white/10 p-2 rounded"
                >
                  <div className="flex items-center gap-4">
                    {renderPreview(file)}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.type}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
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
      </div>
    </NodeViewWrapper>
  );
};
