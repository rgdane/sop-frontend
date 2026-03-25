type TiptapNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: TiptapNode[];
  [key: string]: any;
};

export function getMentions(doc: TiptapNode): number[] {
  const ids: number[] = [];

  const traverse = (node: TiptapNode) => {
    if (node.type === "mention" && node.attrs?.id) {
      ids.push(Number(node.attrs.id));
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(doc);
  return ids;
}
