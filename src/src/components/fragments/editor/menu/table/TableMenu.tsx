import { Editor } from "@tiptap/core";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import tippy, { Instance } from "tippy.js";
import { TableTools } from "../../tools/table/TableTools";
import { CellSelection } from "@tiptap/pm/tables";

interface Props {
  coord: DOMRect | null;
  editor: Editor;
  nodeType?: any;
}

export function isTableCellSelected(editor: Editor): boolean {
  const selection = editor.state.selection;
  return selection instanceof CellSelection;
}

export const TableMenu = ({ coord, editor, nodeType }: Props) => {
  const tippyRef = useRef<Instance | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isCellSelected, setIsCellSelected] = useState(false);
  const isInitializedRef = useRef(false);

  const getCursorCoords = useCallback((editor: Editor): DOMRect | null => {
    const { state, view } = editor;
    const pos = state.selection.from;

    try {
      const coords = view.coordsAtPos(pos);
      return new DOMRect(coords.left, coords.top, 1, 1);
    } catch {
      return null;
    }
  }, []);

  const shouldShowTippy = useMemo(() => {
    return (
      (nodeType === "table" || isTableCellSelected(editor)) &&
      (getCursorCoords(editor) || coord)
    );
  }, [nodeType, editor.state.selection, coord, getCursorCoords]);

  useEffect(() => {
    if (!contentRef.current || isInitializedRef.current) return;

    tippyRef.current = tippy(document.body, {
      content: contentRef.current,
      trigger: "manual",
      placement: "top",
      appendTo: () => document.body,
      animation: "shift-toward",
      duration: 300,
      offset: [70, 0],
      interactive: true,
      hideOnClick: false,
      zIndex: 10000, // Higher than Ant Design Modal (typically 1000)
      getReferenceClientRect: () =>
        getCursorCoords(editor) ||
        coord ||
        ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect),
    });

    isInitializedRef.current = true;

    return () => {
      if (tippyRef.current) {
        tippyRef.current.destroy();
        tippyRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!tippyRef.current || !isInitializedRef.current) return;

    const currentCoord = getCursorCoords(editor) || coord;

    if (shouldShowTippy && currentCoord) {
      tippyRef.current.setProps({
        getReferenceClientRect: () => currentCoord,
      });

      if (!tippyRef.current.state.isVisible) {
        tippyRef.current.show();
      }
    } else {
      if (tippyRef.current.state.isVisible) {
        tippyRef.current.hide();
      }
    }
  }, [shouldShowTippy, coord, getCursorCoords, editor]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const hasSelectedCells = isTableCellSelected(editor);
      setIsCellSelected(hasSelectedCells);
    }, 16);

    return () => clearTimeout(timeoutId);
  }, [editor.state.selection]);

  return (
    <>
      <div ref={contentRef} className="table-menu-content">
        <div
          className={`transition-all duration-300 ease-in-out transform ${
            isCellSelected
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <TableTools editor={editor} />
        </div>
      </div>
    </>
  );
};
