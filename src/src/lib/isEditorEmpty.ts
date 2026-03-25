// Type optional, biar aman kalau JSON TipTap berubah-ubah
type JSONContent = {
  type?: string;
  text?: string;
  content?: JSONContent[];
  attrs?: Record<string, any>;
};

/**
 * Cek apakah isi editor kosong atau tidak.
 * - Paragraf kosong = dianggap kosong
 * - Text non-spasi = dianggap ada isi
 * - Mention = dianggap ada isi
 * - Bullet list / ordered list dengan item berisi text/mention = dianggap ada isi
 */
export function isEditorEmpty(doc?: JSONContent | null): boolean {
  if (!doc?.content) return true;

  const hasContent = (nodes: JSONContent[]): boolean => {
    return nodes.some((node) => {
      // teks non kosong
      if (
        node.type === "text" &&
        ((node.text ?? "").trim().length > 0)   // ⬅️ perbaikan disini
      ) {
        return true;
      }

      // mention selalu dianggap isi
      if (node.type === "mention") {
        return true;
      }

      // cek recursive ke anak node (list, paragraph, dsb.)
      if (node.content && hasContent(node.content)) {
        return true;
      }

      return false;
    });
  };

  return !hasContent(doc.content);
}
