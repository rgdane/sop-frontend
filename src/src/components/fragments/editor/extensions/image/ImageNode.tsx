import React, { useCallback, useState, useEffect } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { createPortal } from "react-dom";
import { BaseImageNodeViewer } from "../media/BaseImageNode";
import { NodeSelection } from "prosemirror-state";

// ✅ Define default dimensions
const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;

export const ImageNodeView = (props: NodeViewProps) => {
  const { node, getPos, editor, selected } = props;

  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const checkSelection = () => {
      try {
        const pos = getPos();
        if (typeof pos !== "number") {
          setIsSelected(false);
          return;
        }

        const { selection } = editor.state;

        if (selection instanceof NodeSelection) {
          setIsSelected(selection.from === pos);
          return;
        }

        setIsSelected(false);
      } catch {
        setIsSelected(false);
      }
    };

    // Check selection immediately
    checkSelection();

    // Listen for selection changes
    const handleSelectionChange = () => checkSelection();
    editor.on('selectionUpdate', handleSelectionChange);
    editor.on('update', handleSelectionChange);

    return () => {
      editor.off('selectionUpdate', handleSelectionChange);
      editor.off('update', handleSelectionChange);
    };
  }, [editor, getPos, node.nodeSize]);

  const { src, alt, title, width, height, uploading, progress } = node.attrs;

  const [resizing, setResizing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const displayWidth = width || DEFAULT_WIDTH;
  const displayHeight = height || DEFAULT_HEIGHT;

  const updateAttributes = useCallback(
    (newWidth: number, newHeight: number) => {
      const pos = getPos();
      if (typeof pos !== "number") return;

      editor.view.dispatch(
        editor.state.tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        })
      );
    },
    [getPos, editor.view, node.attrs]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).classList.contains("resize-handle-image"))
      return;

    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const wrapperDiv = (e.currentTarget as HTMLElement).parentElement;
    const imgEl = wrapperDiv?.querySelector("img");

    if (!imgEl || !wrapperDiv) return;

    const initialWidth = displayWidth;
    const initialHeight = displayHeight;
    const aspectRatio = initialWidth / initialHeight;

    setResizing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = initialWidth + deltaX;
      if (newWidth < 50) newWidth = 50;
      let newHeight = newWidth / aspectRatio;

      imgEl.style.width = `${newWidth}px`;
      imgEl.style.height = `${newHeight}px`;
      wrapperDiv.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setResizing(false);

      const finalWidth = imgEl.clientWidth;
      const finalHeight = imgEl.clientHeight;
      updateAttributes(finalWidth, finalHeight);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("resize-handle-image"))
      return;
    if (resizing) return;
    e.preventDefault();
    e.stopPropagation();
    if (props.extension.options.enableZoom) setIsZoomed(true);
  };

  const closeZoom = () => setIsZoomed(false);

  React.useEffect(() => {
    if (!isZoomed) return;
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoom();
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isZoomed]);

  const nodeViewWrapperStyle: React.CSSProperties = {
    display: "inline-block",
    verticalAlign: "bottom",
  };

  const innerWrapperStyle: React.CSSProperties = {
    width: `${displayWidth}px`,
    position: "relative",
  };

  const imageStyle: React.CSSProperties = {
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    objectFit: "contain",
    cursor: props.extension.options.enableZoom ? "zoom-in" : "default",
    transition: "filter 0.3s ease",
    filter: resizing ? "brightness(0.9)" : "none",
  };

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

  return (
    <>
      <NodeViewWrapper style={nodeViewWrapperStyle}>
        <BaseImageNodeViewer
          src={src}
          alt={alt}
          title={title}
          imageStyle={imageStyle}
          selected={isSelected}
          resizing={resizing}
          handleMouseDown={handleMouseDown}
          innerWrapperStyle={innerWrapperStyle}
          uploading={uploading || (!src && uploading)}
          progress={progress}
        />
      </NodeViewWrapper>
      {ZoomOverlay}
    </>
  );
};