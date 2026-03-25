// ==================
// BaseImageNodeViewer
// ==================
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type ImageMediaProps = {
  src: string;
  alt: string;
  title: string;
  imageStyle: Record<string, any>;
  selected: boolean;
  resizing: boolean;
  handleMouseDown?: (e: React.MouseEvent) => void;
  innerWrapperStyle: Record<string, any>;
  enableZoom?: boolean;
  uploading?: boolean;
  progress?: number;
};

export const BaseImageNodeViewer = ({
  src,
  alt,
  title,
  imageStyle,
  selected,
  resizing,
  handleMouseDown = () => {},
  innerWrapperStyle,
  enableZoom = true,
  uploading = false,
  progress = 0,
}: ImageMediaProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasSelectedOnce, setHasSelectedOnce] = useState(false);

  const innerWrapperClassName = `relative inline-block rounded ${
    selected ? "ring-2 ring-blue-500 ring-offset-1" : ""
  } ${resizing ? "select-none" : ""}`;

  const handleImageClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("resize-handle-image"))
      return;
    if (resizing || uploading) return; // jangan zoom kalau sedang upload

    if (enableZoom) {
      if (!hasSelectedOnce) {
        setHasSelectedOnce(true);
      } else {
        setIsZoomed(true);
      }
    }
  };

  const closeZoom = () => setIsZoomed(false);

  useEffect(() => {
    if (!selected) setHasSelectedOnce(false);
  }, [selected]);

  useEffect(() => {
    if (!isZoomed) return;
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        e.preventDefault();
        closeZoom();
      }
    };
    document.addEventListener("keydown", handleKeyPress, true);
    return () => document.removeEventListener("keydown", handleKeyPress, true);
  }, [isZoomed]);

  const ZoomOverlay =
    isZoomed &&
    createPortal(
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.8)",
          zIndex: 2147483647,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "zoom-out",
        }}
        onClick={closeZoom}
      >
        <img
          src={src}
          alt={alt}
          title={title}
          style={{
            maxWidth: "90%",
            maxHeight: "90%",
            objectFit: "contain",
            cursor: "zoom-out",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>,
      document.body
    );

  // --- Apply cursor sesuai state ---
  const appliedImageStyle: React.CSSProperties = {
    ...imageStyle,
    cursor: enableZoom && hasSelectedOnce && !uploading ? "zoom-in" : "default",
    filter: uploading ? "brightness(0.7)" : imageStyle.filter,
    opacity: uploading ? 0.6 : 1,
  };

  return (
    <>
      <div className={innerWrapperClassName} style={innerWrapperStyle}>
        {uploading || !src ? (
          <div
            className="flex items-center justify-center w-full h-full bg-gray-100 rounded relative"
            style={{ minHeight: "100px" }}
          >
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-8 w-8" />
            {progress > 0 && (
              <div
                className="absolute bottom-1 left-0 right-0 h-1 bg-blue-500 rounded"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        ) : (
          <img
            className="max-w-full rounded block tiptap-image"
            src={src}
            alt={alt}
            title={title}
            style={appliedImageStyle}
            draggable="false"
            onClick={handleImageClick}
          />
        )}

        {selected && !resizing && !uploading && src && (
          <div
            className="resize-handle-image absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize hover:bg-blue-600 hover:scale-110 transition-all shadow-lg"
            onMouseDown={handleMouseDown}
          />
        )}
      </div>
      {ZoomOverlay}
    </>
  );
};
