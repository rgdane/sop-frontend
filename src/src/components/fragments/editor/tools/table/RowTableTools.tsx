import Button from "@/components/ui/Button";
import { useEffect, useRef } from "react";
import tippy, { Instance } from "tippy.js";
import { TbRowInsertBottom, TbRowInsertTop, TbRowRemove } from "react-icons/tb";
import { Editor } from "@tiptap/core";

interface Props {
  parentRef: React.RefObject<HTMLDivElement | null>;
  editor: Editor;
}

export const RowTableTools = ({ parentRef, editor }: Props) => {
  const toolRef = useRef<HTMLDivElement | null>(null);
  const tippyInstance = useRef<Instance | null>(null);
  useEffect(() => {
    if (tippyInstance.current) {
      tippyInstance.current.destroy();
      tippyInstance.current = null;
    }

    if (!toolRef.current || !parentRef.current) return;

    const instance = tippy(parentRef.current, {
      content: toolRef.current,
      trigger: "click",
      placement: "bottom",
      appendTo: () => document.body,
      animation: "shift-toward",
      duration: 300,
      offset: [0, 6],
      interactive: true,
      zIndex: 10001, // Higher than parent RowTableMenu (10000)
      onCreate: (instance) => {
        instance.popper.classList.add(
          "max-md:!sticky",
          "max-md:!bottom-0",
          "max-md:!top-auto",
          "max-md:!transform-none"
        );
      },
    });

    tippyInstance.current = instance;

    return () => {
      if (tippyInstance.current) {
        tippyInstance.current.destroy();
        tippyInstance.current = null;
      }
    };
  }, [parentRef]);

  return (
    <>
      <div
        ref={toolRef}
        className="text-sm min-w-[110px] bg-white dark:bg-[#454545] border border-black/10 dark:border-white/20 rounded-lg shadow-lg p-2 flex flex-col gap-1"
      >
        <Button
          type="text"
          icon={<TbRowInsertTop size={24} />}
          className="!justify-start"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().addRowBefore().run();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          Add Row Before
        </Button>
        <Button
          type="text"
          icon={<TbRowInsertBottom size={24} />}
          className="!justify-start"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().addRowAfter().run();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          Add Row After
        </Button>
        <Button
          type="text"
          icon={<TbRowRemove size={24} />}
          className="!justify-start"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().deleteRow().run();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          Remove Row
        </Button>
      </div>
    </>
  );
};
