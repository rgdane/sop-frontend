import { generateHTML, JSONContent } from "@tiptap/core";
import { EditorExtensions } from "../extensions";

export function renderJSONToHTML(content: JSONContent) {
  if (!content) return "";

  const extensions = EditorExtensions({ useTitle: false, usePlaceholder: false });
  return generateHTML(content, extensions);
}
