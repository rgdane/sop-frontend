"use client";

import { useEffect, useRef, useState } from "react";
import { JSONContent } from "@tiptap/core";
import Editor from "./Editor";

interface ViewerEditorProps {
  value: JSONContent | string;
  dictionary?: any;
}

export const ViewerEditor: React.FC<ViewerEditorProps> = ({
  value,
  dictionary = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Kalau value adalah HTML string, render langsung tanpa Editor
  if (typeof value === 'string') {
    return (
      <div
        ref={containerRef}
        className="tiptap border border-black/20 dark:border-white/20 transition-all rounded-xl p-4"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  // Kalau JSONContent, render pakai Editor
  const [editorKey, setEditorKey] = useState(0);
  const [content, setContent] = useState(value);
  const isInternalUpdate = useRef(false);
  const hasInitialized = useRef(false);

  useEffect(() => {}, [value]);

  return (
    <div
      ref={containerRef}
      className="tiptap border border-black/20 dark:border-white/20 transition-all rounded-xl"
    >
      <Editor
        key={editorKey}
        value={value}
        editable={false}
        isInternalUpdate={isInternalUpdate}
        hasInitialized={hasInitialized}
        setEditorKey={setEditorKey}
        content={content}
        setContent={setContent}
        currentNodeType={null}
        setCurrentNodeType={() => {}}
        nodeCoord={null}
        setNodeCoord={() => {}}
        tableRowCoord={null}
        setTableRowCoord={() => {}}
        tableColCoord={null}
        setTableColCoord={() => {}}
      />
    </div>
  );
};

export default ViewerEditor;