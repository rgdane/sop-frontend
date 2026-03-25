"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Editor from "./Editor";

type OutputFormat = 'html' | 'json';

interface EditorProps {
  keyId?: any;
  value?: any;
  placeholder?: string;
  onChange?: (content: any) => void;
  editable?: boolean;
  mentions?: any[];
  autoFocus?: boolean;
  className?: string;
  size?: "large" | "middle" | "small";
  disableUpload?: boolean;
  fullscreen?: boolean;
  onSelectionChange?: (hasSelection: boolean) => void;
  variant?: "default" | "transparent";
  /** Output format for onChange callback. Default is 'html'. Use 'json' for backward compatibility. */
  outputFormat?: OutputFormat;
}

const InputEditor = forwardRef<any, EditorProps>((props, ref) => {
  const {
    keyId,
    value,
    placeholder = "Tulis komentar...",
    onChange,
    editable = true,
    mentions = [],
    autoFocus = false,
    className = "",
    size = "middle",
    disableUpload = false,
    onSelectionChange,
    fullscreen = true,
    variant,
    outputFormat = "html",
  } = props;

  const editorRef = useRef<any>(null);
  const isInternalUpdate = useRef(false);
  const hasInitialized = useRef(false);
  const [editorKey, setEditorKey] = useState(0);
  const [content, setContent] = useState(value || "");
  const [currentNodeType, setCurrentNodeType] = useState<string | null>(null);
  const [nodeCoord, setNodeCoord] = useState<any>(null);
  const [tableRowCoord, setTableRowCoord] = useState<any>(null);
  const [tableColCoord, setTableColCoord] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    focus: () => editorRef.current?.focus(),
    blur: () => editorRef.current?.blur(),
    getHTML: () => editorRef.current?.getHTML(),
    getJSON: () => editorRef.current?.getJSON(),
    getText: () => editorRef.current?.getText(),
    isEmpty: () => editorRef.current?.isEmpty(),
    setContent: (c: any) => editorRef.current?.setContent(c),
    clear: () => editorRef.current?.clear(),
    addComment: () => editorRef.current?.addComment(),
    hasSelection: () => editorRef.current?.hasSelection(),
  }));

return (
    <Editor
      fullscreen={fullscreen}
      keyId={keyId}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      editable={editable}
      mentions={mentions}
      autoFocus={autoFocus}
      className={className}
      size={size}
      variant={variant}
      disableUpload={disableUpload}
      ref={editorRef}
      isInternalUpdate={isInternalUpdate}
      hasInitialized={hasInitialized}
      setEditorKey={setEditorKey}
      content={content}
      setContent={setContent}
      currentNodeType={currentNodeType}
      setCurrentNodeType={setCurrentNodeType}
      nodeCoord={nodeCoord}
      setNodeCoord={setNodeCoord}
      tableRowCoord={tableRowCoord}
      setTableRowCoord={setTableRowCoord}
      tableColCoord={tableColCoord}
      setTableColCoord={setTableColCoord}
      onSelectionChange={onSelectionChange}
      outputFormat={outputFormat}
    />
  );
});

InputEditor.displayName = "InputEditor";
export default InputEditor;
