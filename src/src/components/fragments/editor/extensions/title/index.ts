import { Extension, mergeAttributes, Node } from "@tiptap/core";
import Document from "@tiptap/extension-document";

export const DocumentWithTitle = Document.extend({
  content: "title block+",
});

export const Title = Node.create({
  name: "title",
  addOptions() {
    return {
      level: 1,
      HTMLAttributes: {
        class: "title",
      },
    };
  },
  content: "inline*",
  marks: "",
  defining: true,
  group: "block",
  renderHTML({ HTMLAttributes }) {
    const { level } = this.options;
    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  parseHTML() {
    return [
      {
        tag: `h${this.options.level}`,
        attrs: { level: this.options.level },
      },
    ];
  },
});
