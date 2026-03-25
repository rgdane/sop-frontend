"use client";

import { Editor } from "@tiptap/core";
import tippy, { Instance } from "tippy.js";
import { useEffect, useRef, useState } from "react";
import "@/styles/tippy.css";
import { DeleteOutlined } from "@ant-design/icons";
import Button from "@/components/ui/Button";
import { ChevronRight, Type } from "lucide-react";
import { ActionTools } from "../../tools/action/ActionTools";
import { NodeSelection } from "@tiptap/pm/state";

interface ActionMenuProps {
  editor: Editor;
  referenceElement: HTMLElement | null;
  currentNode: any;
}

export const ActionMenu = ({
  editor,
  referenceElement,
  currentNode,
}: ActionMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<Instance | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mouseCoords, setMouseCoords] = useState({ x: -99999, y: -99999 });
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !editor ||
      !menuRef.current ||
      !referenceElement ||
      (mouseCoords.x === 0 && mouseCoords.y === 0)
    )
      return;

    const instance = tippy(referenceElement, {
      content: menuRef.current,
      trigger: "manual",
      placement: "top-end",
      appendTo: () => document.body,
      animation: "shift-toward",
      duration: 300,
      maxWidth: 350,
      offset: [0, 6],
      interactive: true,
      interactiveBorder: 10,
      hideOnClick: false,
      zIndex: 10000, // Higher than Ant Design Modal (typically 1000)
      getReferenceClientRect: () => getMouseCoords(),
      onCreate: (instance) => {
        instance.popper.classList.add(
          "max-md:!sticky",
          "max-md:!bottom-0",
          "max-md:!top-auto",
          "max-md:!transform-none"
        );
      },
      onShow: () => setIsVisible(true),
      onHide: () => setIsVisible(false),
    });

    tooltipRef.current = instance;

    return () => {
      tooltipRef.current?.destroy();
      tooltipRef.current = null;
    };
  }, [editor, referenceElement, mouseCoords]);

  // Attach toggle to reference element
  useEffect(() => {
    if (referenceElement) {
      (referenceElement as any).toggleMenu = toggleMenu;
    }
  }, [referenceElement, isVisible]);

  // Update mouse position only when menu not visible
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isVisible) {
        setMouseCoords({ x: event.clientX, y: event.clientY });
      }
    };

    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Element;

      if (menuRef.current?.contains(target) || target.closest(".drag-handle")) {
        return;
      }

      if (tooltipRef.current && isVisible) {
        tooltipRef.current.hide();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isVisible]);

  useEffect(() => {
    if (referenceElement) {
      (referenceElement as any).toggleMenu = toggleMenu;
      (referenceElement as any).setMouseCoords = (coords: {
        x: number;
        y: number;
      }) => {
        setMouseCoords(coords);
      };
    }
  }, [referenceElement, isVisible]);

  // Get virtual rect from saved mouse coords
  const getMouseCoords = () => {
    const { x, y } = mouseCoords;
    return {
      top: y,
      left: x,
      bottom: y,
      right: x,
      width: 0,
      height: 0,
      x,
      y,
      toJSON: () => ({}),
    };
  };

  // Toggle menu visibility and set coords
  const toggleMenu = (event?: Event) => {
    if (!tooltipRef.current) return;

    if (event) {
      event.stopPropagation();
      event.preventDefault();

      if (
        (event instanceof MouseEvent || event instanceof PointerEvent) &&
        !isVisible
      ) {
        setMouseCoords({ x: event.clientX, y: event.clientY });

        setTimeout(() => {
          tooltipRef.current?.show();
        }, 0);
        return;
      }
    }

    if (isVisible) {
      tooltipRef.current.hide();
    } else {
      tooltipRef.current.show();
    }
  };

  const handleDelete = () => {
    if (!editor || !currentNode) return;

    const { state, view } = editor;
    const { tr, selection } = state;

    // Select node dulu kalau belum NodeSelection
    if (!(selection instanceof NodeSelection)) {
      const pos = selection.from;
      const node = state.doc.nodeAt(pos);
      if (node && node.type.name === currentNode) {
        view.dispatch(tr.setSelection(NodeSelection.create(state.doc, pos)));
      }
    }

    editor.chain().focus().deleteNode(currentNode).run();

    tooltipRef.current?.hide();
  };

  const isMediaNode = ["youtube", "image"].includes(currentNode);

  return (
    <div ref={menuRef}>
      <div className="min-w-[110px] pointer-events-auto bg-white dark:bg-[#363636] border border-black/10 dark:border-white/10 rounded-lg shadow-md z-[9999] p-1">
        <div className="w-full flex flex-col gap-y-2 justify-start items-start">
          <div ref={buttonRef}>
            <ActionTools editor={editor} referenceElement={buttonRef.current} />
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
            {currentNode}
            {!isMediaNode && (
              <Button
                className="w-full !justify-start dark:hover:!bg-white/10 border-t"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
