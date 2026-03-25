"use client";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import { MenuItemWithPermission } from "@/types/props/dropdown.types";
import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  StrikethroughOutlined,
} from "@ant-design/icons";
import { Editor } from "@tiptap/react";
import {
  ALargeSmall,
  ChevronDown,
  CodeIcon,
  Heading,
  Languages,
  TableIcon,
  UploadIcon,
} from "lucide-react";
import { ExpandOutlined, FullscreenExitOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

interface TopMenuProps {
  editor: Editor | null;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  disableUpload?: boolean;
}

export default function TopMenu({
  editor,
  onFullscreen,
  isFullscreen = false,
  disableUpload,
}: TopMenuProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>("Normal Teks");
  const [force, setForce] = useState<{ [key: string]: boolean }>({});
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!editor) return;

    editor.on("update", () => {
      setForce({});
    });
    editor.on("selectionUpdate", () => {
      setForce({});
    });
  }, [editor]);

  if (!editor) return null;

  const getActive = (name: string) => editor.isActive(name);

  const toggleMark = (fn: () => void) => {
    fn();
    editor.view.focus();
  };

  const handleMenuClick = (key: string) => {
    if (!editor) return;
    editor.view.focus();

    switch (key) {
      case "text":
        editor.chain().focus().setParagraph().run();
        setSelectedStyle("Normal Teks");
        break;
      case "word":
        editor.chain().focus().setWord("app.login").run();
        setSelectedStyle("Word");
        break;
      case "heading1":
        editor.chain().focus().setHeading({ level: 1 }).run();
        setSelectedStyle("Heading 1");
        break;
      case "heading2":
        editor.chain().focus().setHeading({ level: 2 }).run();
        setSelectedStyle("Heading 2");
        break;
      case "heading3":
        editor.chain().focus().setHeading({ level: 3 }).run();
        setSelectedStyle("Heading");
        break;
    }
  };

  const menuItem = [
    {
      key: "text",
      label: "Normal Teks",
      icon: <ALargeSmall size={16} />,
      onClick: () => handleMenuClick("text"),
    },
    {
      key: "heading3",
      label: "Heading",
      icon: <Heading size={16} />,
      onClick: () => handleMenuClick("heading3"),
    },
    {
      key: "word",
      label: "Word",
      icon: <Languages size={16} />,
      onClick: () => handleMenuClick("word"),
    },
  ] as MenuItemWithPermission[];

  useEffect(() => {
    if (!editor) return;

    const updateStyle = () => {
      if (editor.isActive("heading", { level: 1 })) {
        setSelectedStyle("Heading 1");
      } else if (editor.isActive("heading", { level: 2 })) {
        setSelectedStyle("Heading 2");
      } else if (editor.isActive("heading", { level: 3 })) {
        setSelectedStyle("Heading");
      } else {
        setSelectedStyle("Normal Teks");
      }
    };

    editor.on("update", updateStyle);
    editor.on("selectionUpdate", updateStyle);

    return () => {
      editor.off("update", updateStyle);
      editor.off("selectionUpdate", updateStyle);
    };
  }, [editor]);

  return (
    <div className="overflow-x-auto cursor-pointer text-xs flex rounded-t-xl justify-between items-center px-3 py-2  border-black/20 dark:border-white/20 bg-slate-100 dark:bg-[#262525]">
      <Dropdown trigger={["click"]} menu={{ items: menuItem }}>
        <div className="flex items-center gap-x-2">
          <div className="font-semibold">{selectedStyle}</div>
          <ChevronDown size={12} />
        </div>
      </Dropdown>

      <div className="flex items-center gap-x-8">
        <div className="flex items-center">
          <Button
            type="text"
            icon={<BoldOutlined />}
            className={
              getActive("bold") ? "!bg-gray-200 dark:!bg-[#3b3b3b]" : ""
            }
            onClick={() =>
              toggleMark(() => editor.chain().focus().toggleBold().run())
            }
          />
          <Button
            type="text"
            icon={<ItalicOutlined />}
            className={
              getActive("italic") ? "!bg-gray-200 dark:!bg-[#3b3b3b]" : ""
            }
            onClick={() =>
              toggleMark(() => editor.chain().focus().toggleItalic().run())
            }
          />
          <Button
            type="text"
            icon={<UnderlineOutlined />}
            className={
              getActive("underline") ? "!bg-gray-200 dark:!bg-[#3b3b3b]" : ""
            }
            onClick={() =>
              toggleMark(() => editor.chain().focus().toggleUnderline().run())
            }
          />
          <Button
            type="text"
            icon={<StrikethroughOutlined />}
            className={
              getActive("strike") ? "!bg-gray-200 dark:!bg-[#3b3b3b]" : ""
            }
            onClick={() =>
              toggleMark(() => editor.chain().focus().toggleStrike().run())
            }
          />
          <Button
            type="text"
            icon={<CodeIcon size={16} className="mt-[1px]" />}
            className={
              getActive("code") ? "!bg-gray-200 dark:!bg-[#3b3b3b]" : ""
            }
            onClick={() =>
              toggleMark(() => editor.chain().focus().toggleCode().run())
            }
          />
        </div>

        <div className="flex items-center">
          <Button
            type="text"
            icon={<TableIcon size={16} className="mt-[1px]" />}
            className={
              getActive("table") ? "!bg-gray-200 dark:!bg-[#3b3b3b]" : ""
            }
            onClick={() =>
              toggleMark(() => editor.chain().focus().insertTable().run())
            }
          />
        </div>
      </div>

      <div className="flex items-center">
        <Button
          type="text"
          icon={<OrderedListOutlined />}
          className={
            editor.isActive("orderedList")
              ? "bg-gray-200! dark:bg-[#3b3b3b]!"
              : ""
          }
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Button
          type="text"
          icon={<UnorderedListOutlined />}
          className={
            editor.isActive("bulletList")
              ? "bg-gray-200! dark:bg-[#3b3b3b]!"
              : ""
          }
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />

        <div className="pl-4">
          <Button
            type="text"
            icon={
              isFullscreen ? <FullscreenExitOutlined /> : <ExpandOutlined />
            }
            onClick={onFullscreen}
          />
        </div>
      </div>
    </div>
  );
}
