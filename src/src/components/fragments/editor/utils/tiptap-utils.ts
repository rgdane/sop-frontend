import type { Editor } from "@tiptap/core";

/**
 * Get coordinates of the current active node/selection in TipTap editor
 */
export function getCurrentNodeCoordinates(editor: Editor) {
  const { view, state } = editor;
  const { selection } = state;

  // Method 1: Get coordinates from current selection
  const getSelectionCoords = () => {
    const { from, to } = selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    return {
      start: {
        x: start.left,
        y: start.top,
        bottom: start.bottom,
        right: start.right,
      },
      end: {
        x: end.left,
        y: end.top,
        bottom: end.bottom,
        right: end.right,
      },
      // Selection bounding box
      boundingBox: {
        x: Math.min(start.left, end.left),
        y: Math.min(start.top, end.top),
        width: Math.abs(end.right - start.left),
        height: Math.abs(end.bottom - start.top),
        right: Math.max(start.right, end.right),
        bottom: Math.max(start.bottom, end.bottom),
      },
    };
  };

  // Method 2: Get coordinates of current node (block level)
  const getCurrentNodeCoords = () => {
    const { $from } = selection;
    const node = $from.node($from.depth);
    const nodePos = $from.before($from.depth);

    // Get DOM element for the node
    const domNode = view.domAtPos(nodePos).node;
    let element: Element | null = null;

    if (domNode.nodeType === Node.ELEMENT_NODE) {
      element = domNode as Element;
    } else if (domNode.parentElement) {
      element = domNode.parentElement;
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    }

    return null;
  };

  // Method 3: Get cursor position coordinates
  const getCursorCoords = () => {
    const { from } = selection;
    const coords = view.coordsAtPos(from);

    return {
      x: coords.left,
      y: coords.top,
      bottom: coords.bottom,
      right: coords.right,
    };
  };

  // Method 4: Get coordinates relative to editor container
  const getRelativeCoords = () => {
    const editorRect = view.dom.getBoundingClientRect();
    const cursorCoords = getCursorCoords();

    return {
      x: cursorCoords.x - editorRect.left,
      y: cursorCoords.y - editorRect.top,
      absoluteX: cursorCoords.x,
      absoluteY: cursorCoords.y,
    };
  };

  // Method 5: Get line coordinates (for current line)
  const getCurrentLineCoords = () => {
    const { $from } = selection;
    const lineStart = $from.start($from.depth);
    const lineEnd = $from.end($from.depth);

    const startCoords = view.coordsAtPos(lineStart);
    const endCoords = view.coordsAtPos(lineEnd);

    return {
      start: {
        x: startCoords.left,
        y: startCoords.top,
      },
      end: {
        x: endCoords.right,
        y: endCoords.bottom,
      },
      lineHeight: endCoords.bottom - startCoords.top,
    };
  };

  return {
    selection: getSelectionCoords(),
    currentNode: getCurrentNodeCoords(),
    cursor: getCursorCoords(),
    relative: getRelativeCoords(),
    currentLine: getCurrentLineCoords(),

    // Utility function to get coordinates at specific position
    coordsAtPos: (pos: number) => view.coordsAtPos(pos),

    // Get node info
    nodeInfo: {
      type: selection.$from.node().type.name,
      depth: selection.$from.depth,
      parentType: selection.$from.node(selection.$from.depth - 1)?.type.name,
      position: selection.from,
      nodeSize: selection.$from.node().nodeSize,
    },
  };
}

// Usage examples:
export function useNodeCoordinatesInSlashCommand(editor: Editor) {
  const coords = getCurrentNodeCoordinates(editor);

  // For positioning popup relative to current node
  const getPopupPosition = () => {
    const nodeCoords = coords.currentNode;
    if (!nodeCoords) return { x: 0, y: 0 };

    return {
      x: nodeCoords.x,
      y: nodeCoords.bottom + 8, // 8px below the node
      width: nodeCoords.width,
    };
  };

  // For positioning relative to cursor
  const getCursorPopupPosition = () => {
    const cursorCoords = coords.cursor;

    return {
      x: cursorCoords.x,
      y: cursorCoords.bottom + 4, // 4px below cursor
    };
  };

  return {
    coords,
    getPopupPosition,
    getCursorPopupPosition,
  };
}

// Integration with your SlashCommand for better positioning
export function getSlashCommandPosition(
  editor: Editor,
  clientRect?: () => DOMRect | null
) {
  if (clientRect) {
    const rect = clientRect();
    if (rect) return rect;
  }

  // Fallback to getting coordinates from current position
  const coords = getCurrentNodeCoordinates(editor);
  const cursorCoords = coords.cursor;

  return new DOMRect(
    cursorCoords.x,
    cursorCoords.y,
    0, // width
    cursorCoords.bottom - cursorCoords.y // height
  );
}
