import Button from "@/components/ui/Button";
import { Editor } from "@tiptap/core";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Type,
} from "lucide-react";
import { useEffect, useRef } from "react";
import tippy, { Instance } from "tippy.js";

interface Props {
  editor: Editor;
  referenceElement: HTMLDivElement | null;
}

export interface ActionToolItemType {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const paragraphItems = (editor: Editor): ActionToolItemType[] => [
  {
    key: "paragraph",
    icon: <Type size={20} />,
    label: "Paragraph",
    onClick: () => editor.chain().focus().setParagraph().run(),
  },
  {
    key: "heading1",
    icon: <Heading1 />,
    label: "Heading 1",
    onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    key: "heading2",
    icon: <Heading2 />,
    label: "Heading 2",
    onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    key: "heading3",
    icon: <Heading3 />,
    label: "Heading 3",
    onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
];

export const ActionTools = ({ editor, referenceElement }: Props) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const instance = useRef<Instance | null>(null);

  const listItems: ActionToolItemType[] = [
    {
      key: "unorderedList",
      icon: <List />,
      label: "Unordered List",
      onClick: () => {
        editor.chain().focus().toggleBulletList().run();
      },
    },
    {
      key: "orderedList",
      icon: <ListOrdered />,
      label: "Ordered List",
      onClick: () => {
        editor.chain().focus().toggleOrderedList().run();
      },
    },
  ];

  useEffect(() => {
    if (!referenceElement || !contentRef.current) return;

    instance.current = tippy(referenceElement, {
      content: contentRef.current,
      trigger: "mouseenter",
      placement: "right-start",
      animation: "shift-toward",
      interactive: true,
      zIndex: 10001, // Higher than parent ActionMenu (10000)
    });
  }, [editor, referenceElement]);

  return (
    <>
      <div
        ref={contentRef}
        className="flex flex-col bg-white dark:bg-[#363636] border border-black/10 dark:border-white/10 rounded-lg shadow"
      >
        <div className="border-b border-black/10 dark:border-white/10 px-3 py-2">
          <div className="text-xs mb-2">Text</div>
          <div className="flex items-center gap-x-3">
            {paragraphItems(editor).map((item, index) => (
              <Button
                key={index}
                className="w-full !p-2 dark:hover:!bg-white/10"
                type="text"
                icon={item.icon}
                onClick={() => {
                  item.onClick();
                  instance.current?.hide();
                }}
              />
            ))}
          </div>
        </div>
        <div className="border-b border-black/10 dark:border-white/10 px-3 py-2">
          <div className="text-xs mb-2">List</div>
          <div className="flex items-center gap-x-3">
            {listItems.map((item, index) => (
              <Button
                key={index}
                className="w-full !p-2 dark:hover:!bg-white/10"
                type="text"
                icon={item.icon}
                onClick={() => {
                  item.onClick();
                  instance.current?.hide();
                  referenceElement?.hidden;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
