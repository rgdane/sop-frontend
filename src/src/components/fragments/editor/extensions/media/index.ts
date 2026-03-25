import { Node, CommandProps, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { UploaderMediaNodeView } from "./UploaderMediaNode";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    media: {
      /**
       * Insert uploader node
       */
      insertMedia: (options?: {
        src?: string;
        uploading?: boolean;
        progress?: number;
        mime?: string;
        name?: string;
        size?: number;
        width?: number;
        height?: number;
      }) => ReturnType;
      /**
       * Update media size
       */
      updateMediaSize: (attrs: {
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}

export const Media = Node.create({
  name: "media",
  group: "block",
  atom: true,
  draggable: false,
  selectable: true,

  addAttributes() {
    return {
      id: {
        default: () => `media-${Math.random().toString(36).substr(2, 9)}`,
      },
      src: { default: null },
      uploading: { default: true },
      progress: { default: 0 },
      mime: { default: null },
      name: { default: null },
      size: { default: null },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
      aspectRatio: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: "media-block" }];
  },

  renderHTML({ HTMLAttributes }) {
    if (
      HTMLAttributes.mime === "image/jpeg" ||
      HTMLAttributes.mime === "image/png" ||
      (HTMLAttributes.mime === "image/jpg" &&
        HTMLAttributes.src &&
        !HTMLAttributes.uploading)
    ) {
      const style: string[] = ["cursor: zoom-in;"];

      if (HTMLAttributes.width) {
        style.push(`width: ${HTMLAttributes.width}px;`);
      }
      if (HTMLAttributes.height) {
        style.push(`height: ${HTMLAttributes.height}px;`);
      }

      const attrs = mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: "tiptap-image",
          style: style.join(" "),
        }
      );
      return ["img", attrs];
    }
    return ["media-block", HTMLAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(UploaderMediaNodeView);
  },

  addCommands() {
    return {
      insertMedia:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              id: `media-${Date.now()}`,
              ...options,
            },
          });
        },
      updateMediaSize:
        (attrs) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attrs);
        },
    };
  },
});
