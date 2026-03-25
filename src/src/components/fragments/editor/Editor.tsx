"use client";
import TopMenu from "@/components/fragments/editor/menu/TopMenu";
import Button from "@/components/ui/Button";
import { cva } from "class-variance-authority"
import { formatDictionary } from "@/lib/formatDictionary";
import {
  ExpandOutlined,
  FullscreenExitOutlined
} from "@ant-design/icons";
import { EditorView } from "@tiptap/pm/view";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from "react";
import { CommentEditor } from "./CommentEditor";
import { EditorExtensions } from "./extensions";
import { CommentMark } from "./extensions/commentMark/commentMark";
import { ColTableMenu } from "./menu/table/ColTableMenu";
import { RowTableMenu } from "./menu/table/RowTableMenu";
import { TableMenu } from "./menu/table/TableMenu";
import {
  GetTableColumnCoords,
  GetTableRowCoords,
  GetTopLevelBlockCoords,
  GetTopLevelNode,
} from "./utils/pm-utils";
import { cn } from "@/lib/tailwindMerge";
import { LinkEditModal } from "./extensions/hyperlink/HyperlinkNode";

type OutputFormat = 'html' | 'json';

interface EditorProps {
  keyId?: any;
  fullscreen?: boolean;
  value?: any;
  placeholder?: string;
  onChange?: (content: any) => void;
  editable?: boolean;
  mentions?: any[];
  autoFocus?: boolean;
  className?: string;
  size?: "large" | "middle" | "small";
  disableUpload?: boolean;
  isInternalUpdate: React.MutableRefObject<boolean>;
  hasInitialized: React.MutableRefObject<boolean>;
  setEditorKey: React.Dispatch<React.SetStateAction<number>>;
  content: any;
  setContent: React.Dispatch<React.SetStateAction<any>>;
  currentNodeType: string | null;
  setCurrentNodeType: React.Dispatch<React.SetStateAction<string | null>>;
  nodeCoord: any;
  setNodeCoord: React.Dispatch<React.SetStateAction<any>>;
  tableRowCoord: any;
  setTableRowCoord: React.Dispatch<React.SetStateAction<any>>;
  tableColCoord: any;
  setTableColCoord: React.Dispatch<React.SetStateAction<any>>;
  disabled?: boolean;
  onSelectionChange?: (hasSelection: boolean) => void;
  variant?: "default" | "transparent";
  /** Output format for onChange callback. Default is 'html'. Use 'json' for backward compatibility. */
  outputFormat?: OutputFormat;
}

const Variants = cva('rounded-xl border-black/20 dark:border-white/20 transition-all', {
  variants: {
    variant: {
      transparent: 'bg-transparent',
      default: 'bg-white dark:bg-[#242424] border',
    },
  },
  defaultVariants: {
    variant: 'default',
  }
})

const Editor = forwardRef<any, EditorProps>((props, ref) => {
  const [dictionary, setDictionary] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const [activeComment, setActiveComment] = useState<{
    id: string;
  } | null>(null);

  // Link Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '' });
  const linkResolveRef = useRef<((result: { url: string; text: string } | null) => void) | null>(null);

  const {
    keyId,
    fullscreen,
    value,
    placeholder = "Tulis komentar...",
    onChange,
    editable = true,
    mentions = [],
    autoFocus = false,
    className = "",
    size = "middle",
    disableUpload = false,
    isInternalUpdate,
    hasInitialized,
    setEditorKey,
    content,
    setContent,
    currentNodeType,
    setCurrentNodeType,
    nodeCoord,
    setNodeCoord,
    tableRowCoord,
    setTableRowCoord,
    tableColCoord,
    setTableColCoord,
    variant = "default",
    outputFormat = "html",
  } = props;

  const getMinHeight = () => {
    switch (size) {
      case "small":
        return "60px";
      case "large":
        return "120px";
      default:
        return "80px";
    }
  };

  const handleEditLink = useCallback(async (url: string, text: string) => {
    return new Promise<{ url: string; text: string } | null>((resolve) => {
      setLinkData({ url, text });
      setModalOpen(true);
      linkResolveRef.current = resolve;
    });
  }, []);

  const handleLinkSave = useCallback((url: string, text: string) => {
    if (linkResolveRef.current) {
      linkResolveRef.current({ url, text });
      linkResolveRef.current = null;
    }
    setModalOpen(false);
  }, []);

  const handleLinkRemove = useCallback(() => {
    if (linkResolveRef.current) {
      linkResolveRef.current({ url: '', text: '' });
      linkResolveRef.current = null;
    }
    setModalOpen(false);
  }, []);

  const handleLinkClose = useCallback(() => {
    if (linkResolveRef.current) {
      linkResolveRef.current(null);
      linkResolveRef.current = null;
    }
    setModalOpen(false);
  }, []);

  const editor = useEditor(
    {
      editable: editable,

      extensions: [
        ...EditorExtensions({
          dictionary,
          useTitle: false,
          onEditLink: handleEditLink,
        }),
        CommentMark.configure({
          onCommentClick: (commentId) => {
            setActiveComment({
              id: commentId,
            });
          },
        }),
      ],
      content: value,
      editorProps: {
        attributes: {
          class: `min-h-[${getMinHeight()}] focus:outline-none text-sm text-gray-800 dark:text-gray-200 p-3`,
          placeholder,
        },
      },
      onCreate: ({ editor }) => {
        if (editor.commands.setLocale) {
          editor.commands.setLocale("id");
        }

        const wordNodeExt = editor.extensionManager.extensions.find(
          (ext: any) => ext.name === "wordNode"
        );
      },
      onUpdate: ({ editor }) => {
        if (isInternalUpdate.current) return;

        if (outputFormat === 'html') {
          // Return HTML string
          onChange?.(editor.getHTML());
        } else {
          // Return JSON (backward compatible)
          const rawJSON = editor.getJSON();
          function transformNode(nodes: any): any {
            if (!nodes) return nodes;
            const result: any[] = [];
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              const next = nodes[i + 1];
              if (
                node.type === "text" &&
                node.text === "$" &&
                next?.type === "wordNode"
              ) {
                continue;
              }
              if (node.type === "wordNode") {
                result.push(node);
              } else if (node.content) {
                result.push({ ...node, content: transformNode(node.content) });
              } else {
                result.push(node);
              }
            }
            return result;
          }
          const transformed = {
            ...rawJSON,
            content: transformNode(rawJSON.content),
          };
          onChange?.(transformed);
        }
      },
      onSelectionUpdate: ({ editor }) => {
        const { from, to } = editor.state.selection;
        const hasSel = from !== to;
        setHasTextSelection(hasSel);
        props.onSelectionChange?.(hasSel);
      },
      immediatelyRender: false,
    },
    [dictionary, handleEditLink, outputFormat]
  );

  const getCurrentNode = useCallback(() => {
    if (!editor) return;

    try {
      const topNode = GetTopLevelNode(editor.view as EditorView);
      const nodeType = topNode?.type.name || null;
      setCurrentNodeType(nodeType);
    } catch (error) {
      setCurrentNodeType(null);
    }
  }, [editor, dictionary, setCurrentNodeType]);

  const getTableRowCoord = useCallback(() => {
    if (!editor) return;

    try {
      const coord = GetTableRowCoords(editor.view as EditorView);

      setTableRowCoord(coord);
    } catch (error) {
      setTableRowCoord(null);
    }
  }, [editor, dictionary, setTableRowCoord]);

  const getTableColCoord = useCallback(() => {
    if (!editor) return;

    try {
      const coord = GetTableColumnCoords(editor.view as EditorView);
      setTableColCoord(coord);
    } catch (error) {
      setTableColCoord(null);
    }
  }, [editor, dictionary, setTableColCoord]);

  const getCoordNode = useCallback(() => {
    if (!editor) return;

    try {
      const coord = GetTopLevelBlockCoords(editor.view as EditorView);

      setNodeCoord(coord);
    } catch (error) {
      setNodeCoord(null);
    }
  }, [editor, dictionary, setNodeCoord]);

  const updateAllCoords = useCallback(() => {
    getCurrentNode();
    getCoordNode();
    getTableRowCoord();
    getTableColCoord();
  }, [getCurrentNode, getCoordNode, getTableRowCoord, getTableColCoord]);

  const editorAddEventListener = useCallback(
    (editor: any) => {
      editor.on("selectionUpdate", updateAllCoords);
      editor.on("transaction", updateAllCoords);
    },
    [updateAllCoords]
  );

  const editorRemoveEventListener = useCallback(
    (editor: any) => {
      editor.off("selectionUpdate", updateAllCoords);
      editor.off("transaction", updateAllCoords);
    },
    [updateAllCoords]
  );

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editor?.commands.focus(),
      blur: () => editor?.commands.blur(),
      getHTML: () => editor?.getHTML(),
      getJSON: () => editor?.getJSON(),
      getText: () => editor?.getText(),
      isEmpty: () => editor?.isEmpty,
      setContent: (c: any) => editor?.commands.setContent(c),
      clear: () => editor?.commands.clearContent(),
      addComment: () => {
        if (!editor) return null;
        const { from, to } = editor.state.selection;
        if (from === to) return null;

        const id = crypto.randomUUID();
        editor.chain().setCommentMark({ id }).run();
        const selectedText = editor.state.doc.textBetween(from, to);

        return { id, text: selectedText };
      },
      hasSelection: () => {
        if (!editor) return false;
        const { from, to } = editor.state.selection;
        return from !== to;
      },
      getSelectionState: () => hasTextSelection,
    }),
    [editor, hasTextSelection]
  );

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Sync editor content with external value prop
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // Skip if this is an internal update (user typing)
    if (isInternalUpdate.current) return;

    // Mark as initialized on first run
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    // Handle null/empty value - clear editor
    if (!value) {
      if (!editor.isEmpty) {
        isInternalUpdate.current = true;
        editor.commands.clearContent();
        requestAnimationFrame(() => {
          isInternalUpdate.current = false;
        });
      }
      return;
    }

    const currentJSON = editor.getJSON();
    const currentHTML = editor.getHTML();

    const valueIsHTML = typeof value === 'string';
    const isSameContent = valueIsHTML
      ? currentHTML === value
      : JSON.stringify(currentJSON) === JSON.stringify(value);

    if (!isSameContent) {
      isInternalUpdate.current = true;
      editor.commands.setContent(value);
      requestAnimationFrame(() => {
        isInternalUpdate.current = false;
      });
    }
  }, [value, editor, isInternalUpdate, hasInitialized]);

  useEffect(() => {
    if (!editor) return;

    updateAllCoords();
    editorAddEventListener(editor);

    return () => {
      editorRemoveEventListener(editor);
      setCurrentNodeType(null);
      setNodeCoord(null);
      setTableRowCoord(null);
      setTableColCoord(null);
    };
  }, [
    editor,
    dictionary,
    updateAllCoords,
    editorAddEventListener,
    editorRemoveEventListener,
    setCurrentNodeType,
    setNodeCoord,
    setTableRowCoord,
    setTableColCoord,
  ]);

  useEffect(() => {
    if (editor && autoFocus && hasInitialized.current) {
      const timer = setTimeout(() => {
        if (editor && !editor.isDestroyed) {
          editor.commands.focus();
          const { doc } = editor.state;
          editor.commands.setTextSelection(doc.content.size);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editor, autoFocus, hasInitialized]);

  useEffect(() => {
    if (!editor || editor.isDestroyed || !isFullscreen) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        editor.commands.focus();
      });
    });
  }, [isFullscreen, editor]);

  if (!editor) {
    return (
      <div
        className={` rounded-xl border-black/20 dark:border-white/20 ${className}`}
        style={{ minHeight: getMinHeight() }}
      >
        <div className={`min-h-[${getMinHeight()}] p-3 text-sm text-gray-400`}>
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(Variants({ variant }), className, `${className} ${isFullscreen
          ? "fixed! inset-0! w-screen! !h-screen !z-[9999] !bg-white dark:!bg-[#242424] !flex !flex-col !m-0 !rounded-none"
          : ""
          }`)}
      >
        {editable && (
          <TopMenu
            editor={editor}
            onFullscreen={handleFullscreen}
            isFullscreen={isFullscreen}
            disableUpload={disableUpload}
          />
        )}

        {!editable && fullscreen && (
          <div className="absolute z-999 w-full flex justify-end p-2 border-black/20 dark:border-white/20">
            <Button
              type="text"
              className="bg-black/10! hover:bg-black/30!"
              onClick={handleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <FullscreenExitOutlined /> : <ExpandOutlined />}
            </Button>
          </div>
        )}

        {currentNodeType === "table" && editable && (
          <div className="">
            <TableMenu
              coord={nodeCoord}
              editor={editor}
              nodeType={currentNodeType}
            />
            <RowTableMenu coord={tableRowCoord} editor={editor} />
            <ColTableMenu coord={tableColCoord} editor={editor} />
          </div>
        )}

        <div
          className={`flex-1 px-4 overflow-y-auto  ${isFullscreen ? "h-full w-full" : ""
            }`}
        >
          <EditorContent editor={editor} />
          {activeComment && (
            <CommentEditor
              activeComment={activeComment}
              setActiveComment={setActiveComment}
            />
          )}
        </div>
      </div>

      {/* Link Edit Modal */}
      <LinkEditModal
        isOpen={modalOpen}
        url={linkData.url}
        text={linkData.text}
        onSave={handleLinkSave}
        onRemove={handleLinkRemove}
        onClose={handleLinkClose}
      />
    </>
  );
});

Editor.displayName = "InputEditor";
export default Editor;