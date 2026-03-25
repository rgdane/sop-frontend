import { Editor } from "@tiptap/core";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import Button from "@/components/ui/Button";
import { Tooltip } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  SubnodeOutlined,
  HighlightOutlined,
} from "@ant-design/icons";
import clsx from "clsx";
import { Code, Superscript } from "lucide-react";

interface Props {
  editor: Editor;
  currentNode: string | null;
}

export const textStyleItems = (editor: Editor) => [
  {
    key: "bold",
    icon: <BoldOutlined className="!text-md" />,
    label: "Bold",
    onClick: () => editor.chain().focus().toggleBold().run(),
    isActive: editor.isActive("bold"),
  },
  {
    key: "italic",
    icon: <ItalicOutlined className="!text-md" />,
    label: "Italic",
    onClick: () => editor.chain().focus().toggleItalic().run(),
    isActive: editor.isActive("italic"),
  },
  {
    key: "underline",
    icon: <UnderlineOutlined className="!text-md" />,
    label: "Underline",
    onClick: () => editor.chain().focus().toggleUnderline().run(),
    isActive: editor.isActive("underline"),
  },
  {
    key: "strike",
    icon: <StrikethroughOutlined className="!text-md" />,
    label: "Strike",
    onClick: () => editor.chain().focus().toggleStrike().run(),
    isActive: editor.isActive("strike"),
  },
  {
    key: "highlight",
    icon: <HighlightOutlined className="!text-md" />,
    label: "Highlight",
    onClick: () => editor.chain().focus().toggleHighlight().run(),
    isActive: editor.isActive("highlight"),
  },
  {
    key: "code",
    icon: <Code size={16} />,
    label: "Code",
    onClick: () => editor.chain().focus().toggleCode().run(),
    isActive: editor.isActive("code"),
  },
  {
    key: "subscript",
    icon: <SubnodeOutlined className="!text-md" />,
    label: "Subscript",
    onClick: () => editor.chain().focus().toggleSubscript().run(),
    isActive: editor.isActive("subscript"),
  },
  {
    key: "superscript",
    icon: <Superscript size={16} />,
    label: "Superscript",
    onClick: () => editor.chain().focus().toggleSuperscript().run(),
    isActive: editor.isActive("superscript"),
  },
];

export const filterAvailableCommands = (
  tools: ReturnType<typeof textStyleItems>,
  editor: Editor
) => {
  return tools.filter((tool) => {
    switch (tool.key) {
      case "bold":
        return editor.can().chain().focus().toggleBold().run();
      case "italic":
        return editor.can().chain().focus().toggleItalic().run();
      case "underline":
        return editor.can().chain().focus().toggleUnderline().run();
      case "strike":
        return editor.can().chain().focus().toggleStrike().run();
      case "highlight":
        return editor.can().chain().focus().toggleHighlight().run();
      case "code":
        const activeMarks = [
          "bold",
          "italic",
          "underline",
          "strike",
          "highlight",
          "subscript",
          "superscript",
        ];
        const hasOtherMarks = activeMarks.some((mark) => editor.isActive(mark));
        if (hasOtherMarks) return false;
        return editor.can().chain().focus().toggleCode().run();
      case "subscript":
        return editor.can().chain().focus().toggleSubscript().run();
      case "superscript":
        return editor.can().chain().focus().toggleSuperscript().run();
      default:
        return true;
    }
  });
};

export const BubbleMenu = ({ editor, currentNode }: Props) => {
  const shouldShowMenu = currentNode === "paragraph";

  const tools = textStyleItems(editor);
  const filteredTools = filterAvailableCommands(tools, editor);
  const items = filteredTools;

  return (
    <>
      {shouldShowMenu && (
        <TiptapBubbleMenu
          editor={editor}
          options={{ placement: "top", offset: 8 }}
        >
          <div className="flex flex-col bg-white dark:bg-[#363636] border border-black/10 dark:border-white/10 rounded-lg shadow">
            <div className="flex items-center gap-x-1 px-2 py-1">
              {items.map((item) => (
                <Tooltip key={item.key} title={item.label}>
                  <Button
                    className={clsx(
                      "w-full !p-2 dark:hover:!bg-white/10",
                      item.isActive && "!bg-black/10 dark:!bg-white/20"
                    )}
                    type="text"
                    icon={item.icon}
                    onClick={item.onClick}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        </TiptapBubbleMenu>
      )}
    </>
  );
};
