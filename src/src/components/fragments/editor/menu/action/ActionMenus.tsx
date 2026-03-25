import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import { DeleteOutlined } from "@ant-design/icons";
import { Editor } from "@tiptap/core";
import { ChevronRight, Type } from "lucide-react";
import { ActionTools } from "../../tools/action/ActionTools";
import { useEffect, useRef, useState } from "react";
import "@/styles/tippy.css";

interface Props {
  currentNode: any;
  editor: Editor;
  coord: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } | null;
}

export const ActionMenus = ({ currentNode, editor, coord }: Props) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [refEl, setRefEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Setelah render pertama, set ref element ke state
    if (buttonRef.current) {
      setRefEl(buttonRef.current);
    }
  }, []);

  if (!coord) return null;

  const x = (coord.left + coord.right) / 2 - 150;
  const y = coord.top + 40;

  const handleDelete = () => {
    if (currentNode === "youtube" || currentNode === "image") {
      editor.chain().focus().selectNodeForward().deleteSelection().run();
    } else {
      editor.chain().focus().deleteNode(currentNode).blur().run();
    }
  };

  const menu = (
    <div
      className="absolute"
      style={{
        zIndex: 2147483647,
        top: `${y}px`,
        left: `${x}px`,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="min-w-[110px] pointer-events-auto bg-white dark:bg-[#363636] border border-black/10 dark:border-white/10 rounded-lg shadow-md p-1">
        <div className="w-full flex flex-col gap-y-2 justify-start items-start">
          <div ref={buttonRef}>
            {buttonRef.current && (
              <ActionTools
                editor={editor}
                referenceElement={buttonRef.current}
              />
            )}{" "}
            <Button
              className="w-full !justify-start dark:hover:!bg-white/10"
              type="text"
              icon={<Type size={16} />}
            >
              Paragraph Style
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="border-t w-full pt-1 border-black/10 dark:border-white/10">
            <Button
              className="w-full !justify-start dark:hover:!bg-white/10 border-t"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Portal ke body biar keluar dari stacking context editor
  return createPortal(menu, document.body);
};
