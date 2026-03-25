import { Slice, Fragment, Node } from "@tiptap/pm/model";
import { ReplaceStep } from "@tiptap/pm/transform";
import { Selection, EditorState } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

interface Editor {
  view: EditorView;
}

interface ViewDesc {
  node: Node;
  nodeDOM?: HTMLElement;
}

interface ExtendedEditorView extends EditorView {
  lastSelectedViewDesc?: ViewDesc;
}

export const GetTopLevelBlockCoords = (view: EditorView): DOMRect => {
  const $pos = view.state.selection.$from;
  const from = $pos.before(1);
  const coords = view.coordsAtPos(from);

  return new DOMRect(coords.left, coords.top, 0, 0);
};

export const GetTableRowCoords = (view: EditorView): DOMRect | null => {
  const pos = view.state.selection.$from;
  let { depth } = pos;

  while (depth > 1) {
    if (pos.node(depth).type.name === "tableRow") break;
    depth -= 1;
  }

  if (depth <= 0) return null;

  const from = pos.before(depth);
  const dom = view.nodeDOM(from) as HTMLElement;

  if (!dom || !(dom instanceof HTMLElement)) return null;

  const rect = dom.getBoundingClientRect();
  return new DOMRect(rect.x, rect.y, rect.width, rect.height);
};

export const GetTableColumnCoords = (view: EditorView): DOMRect | false => {
  const pos = view.state.selection.$from;
  let { depth } = pos;
  let cellDepth = 0;
  let tableDepth = 0;
  while (depth > 0) {
    if (
      pos.node(depth).type.name === "tableCell" ||
      pos.node(depth).type.name === "tableHeader"
    ) {
      cellDepth = depth;
    }
    if (pos.node(depth).type.name === "table") {
      tableDepth = depth;
      break;
    }
    depth -= 1;
  }
  if (!(tableDepth && cellDepth)) {
    return false;
  }
  const cellRect = (
    view.nodeDOM(pos.before(cellDepth)) as HTMLElement
  ).getBoundingClientRect();
  const tableRect = (
    view.nodeDOM(pos.before(tableDepth)) as HTMLElement
  ).getBoundingClientRect();

  return new DOMRect(cellRect.x, tableRect.y, cellRect.width, tableRect.height);
};

/**
 * Gets the top level node of the selection.
 * If the selection is at the root of the document and there is a last selected view description,
 * this will return the node that was last selected.
 * Otherwise, this will return `selectionStart.node(1)`.
 */
export const GetTopLevelNode = (view: ExtendedEditorView): Node | null => {
  const selectionStart = view.state.selection.$from;
  if (selectionStart.node(1) == null && view.lastSelectedViewDesc) {
    return view.lastSelectedViewDesc.node;
  }

  return selectionStart.node(1);
};

export const GetNodeTree = (view: ExtendedEditorView): string[] => {
  const nodes: string[] = [];
  const selectionStart = view.state.selection.$from;

  if (selectionStart.node(1) == null && view.lastSelectedViewDesc) {
    return [view.lastSelectedViewDesc.node.type.name];
  }

  let { depth } = selectionStart;
  while (depth >= 0) {
    nodes.push(selectionStart.node(depth).type.name);
    depth -= 1;
  }

  return nodes.reverse();
};

/**
 * Gets the top-level block element of the selection.
 *
 * If the selection is inside a node that has a view description (i.e. it was previously selected),
 * this will return the nodeDOM of the last selected view description.
 * Otherwise, this will return the top-level block element of the selection.
 *
 * For example, if the selection is inside a code block, this will return the <pre> element, not the
 * <code> element.
 *
 * @returns The top-level block element of the selection, or undefined if the selection is at the root
 * of the document.
 */
export const GetTopLevelBlock = (editor: Editor): HTMLElement | undefined => {
  const extendedView = editor.view as ExtendedEditorView;
  const selectionStart = extendedView.state.selection.$from;
  let parentNode = extendedView.domAtPos(selectionStart.posAtIndex(0, 1))
    .node as HTMLElement;
  if (parentNode === extendedView.dom) {
    return extendedView.lastSelectedViewDesc?.nodeDOM;
  }

  // Sometimes we get a node that isn't the top-level parent; e.g. codeBlock gives us the <code> not the wrapping <pre>
  while (
    parentNode !== extendedView.dom &&
    parentNode.parentNode !== extendedView.dom
  ) {
    parentNode = parentNode.parentNode as HTMLElement;
  }

  return parentNode;
};

const mapChildren = <T>(
  node: Node | Fragment,
  callback: (node: Node, index: number, parent: Fragment) => T
): T[] => {
  const array: T[] = [];
  for (let i = 0; i < node.childCount; i += 1) {
    array.push(
      callback(node.child(i), i, node instanceof Fragment ? node : node.content)
    );
  }

  return array;
};

interface DragNodeParams {
  view: EditorView;
  state: EditorState;
  draggedNodePosition: number;
  targetNodePosition: number;
}

export const DragNode = ({
  view,
  state,
  draggedNodePosition,
  targetNodePosition,
}: DragNodeParams): void => {
  const targetResolved = state.doc.resolve(targetNodePosition);
  const draggedNode = state.doc.resolve(draggedNodePosition).node(1);
  if (draggedNode) {
    const targetNode = targetResolved.node(1);
    const { tr } = view.state;
    const parent = targetResolved.node(0);
    const parentPos = targetResolved.start(0);

    const arr = mapChildren(parent, (node) => node);
    const fromIndex = arr.indexOf(draggedNode);
    const targetIndex = arr.indexOf(targetNode);
    const replaceStart = parentPos;
    const replaceEnd = targetResolved.end(0);
    const arrItem = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(targetIndex, 0, arrItem);
    const slice = new Slice(Fragment.fromArray(arr), 0, 0);
    tr.step(new ReplaceStep(replaceStart, replaceEnd, slice, false));

    tr.setSelection(Selection.near(tr.doc.resolve(targetNodePosition)));

    view.dispatch(tr);
  }
};

interface MoveNodeParams {
  view: EditorView;
  dir: "UP" | "DOWN";
  currentResolved: ReturnType<EditorState["doc"]["resolve"]> | null;
}

export const MoveNode = ({
  view,
  dir,
  currentResolved,
}: MoveNodeParams): boolean => {
  if (!currentResolved) {
    return false;
  }
  const { tr } = view.state;
  const isDown = dir === "DOWN";
  const currentNode = currentResolved.node(1) || currentResolved.nodeAfter;
  const parentDepth = 0;
  const parent = currentResolved.node(parentDepth);
  const parentPos = currentResolved.start(parentDepth);

  const arr = mapChildren(parent, (node) => node);
  const index = arr.indexOf(currentNode);

  if (index === 0) {
    return false;
  }

  const swapWithIndex = isDown ? index + 1 : index - 1;
  // If swap is out of bound
  if (swapWithIndex >= arr.length || swapWithIndex < 0) {
    return false;
  }

  const swapWithNodeSize = arr[swapWithIndex].nodeSize;
  [arr[index], arr[swapWithIndex]] = [arr[swapWithIndex], arr[index]];

  const replaceStart = parentPos;
  const replaceEnd = currentResolved.end(parentDepth);

  const slice = new Slice(Fragment.fromArray(arr), 0, 0);
  tr.step(new ReplaceStep(replaceStart, replaceEnd, slice, false));

  tr.setSelection(
    Selection.near(
      tr.doc.resolve(
        isDown
          ? currentResolved.pos + swapWithNodeSize
          : currentResolved.pos - swapWithNodeSize
      )
    )
  );

  view.dispatch(tr);
  return true;
};
