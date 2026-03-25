import { mergeAttributes, Node, nodeInputRule, PasteRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Plugin } from "prosemirror-state";
import axiosInstance from "@/config/axios";
import { ImageNodeView } from "./ImageNode";

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
  enableZoom: boolean;
}

export interface SetImageOptions {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: SetImageOptions) => ReturnType;
      updateImageSize: (attrs: {
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}

/** Regex for markdown and image URLs + base64 */
export const inputRegex =
  /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;
export const imageUrlRegex =
  /(?:^|\s)((https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|ico)(?:\?[^\s]*)?)|data:image\/[a-zA-Z]+;base64,[^"'\s]+)/gi;

/** Base64 → File */
async function base64ToFile(
  base64: string,
  filename = "pasted-image.png"
): Promise<File> {
  const arr = base64.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime });
}

/** Upload file(s) axiosInstance */
async function handleUploadImage(
  files: File[],
  onProgress?: (percent: number) => void
): Promise<{ url: string }[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("file", file));

  const res = await axiosInstance.post("/files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    },
  });

  if (Array.isArray(res.data))
    return res.data.map((item: any) => ({ url: item.url }));
  if (res.data.data[0].object_name)
    return [
      {
        url: `${process.env.NEXT_PUBLIC_API_URL}/files/${res.data.data[0].object_name}`,
      },
    ];
  throw new Error("Upload failed: no URL returned");
}

/** Upload base64 image */
export async function uploadBase64Image(
  base64: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const file = await base64ToFile(base64);
  const result = await handleUploadImage([file], onProgress);
  return result[0].url;
}

/** Plugin untuk handle paste / drag & drop */
const imageUploadPlugin = new Plugin({
  props: {
    handlePaste(view, event) {
      const items = event.clipboardData?.items;
      if (!items) return false;

      for (const item of items) {
        if (!item.type.startsWith("image/")) continue;

        const file = item.getAsFile();
        if (!file) continue;

        const uploadId = `upload-${Date.now()}-${Math.random()}`;

        // Insert placeholder
        const { state, dispatch } = view;
        const node = state.schema.nodes.image.create({
          src: "",
          alt: uploadId,
          uploading: true,
          progress: 0,
        });
        const tr = state.tr.replaceSelectionWith(node);
        dispatch(tr);

        // Upload async
        handleUploadImage([file], (percent) => {
          const { tr } = view.state;
          view.state.doc.descendants((n, pos) => {
            if (n.type.name === "image" && n.attrs.alt === uploadId) {
              tr.setNodeMarkup(pos, undefined, {
                ...n.attrs,
                progress: percent,
              });
            }
          });
          if (tr.steps.length) view.dispatch(tr);
        }).then(([res]) => {
          const { tr } = view.state;
          view.state.doc.descendants((n, pos) => {
            if (n.type.name === "image" && n.attrs.alt === uploadId) {
              tr.setNodeMarkup(pos, undefined, {
                ...n.attrs,
                src: res.url,
                uploading: false,
                alt: "",
              });
            }
          });
          if (tr.steps.length) view.dispatch(tr);
        });

        return true;
      }

      return false;
    },

    handleDrop(view, event, _slice, moved) {
      const items = event.dataTransfer?.files;
      if (!items || items.length === 0) return false;

      for (const file of items) {
        if (!file.type.startsWith("image/")) continue;

        const uploadId = `upload-${Date.now()}-${Math.random()}`;

        const { state, dispatch } = view;
        const node = state.schema.nodes.image.create({
          src: "",
          alt: uploadId,
          uploading: true,
          progress: 0,
        });
        const tr = state.tr.replaceSelectionWith(node);
        dispatch(tr);

        handleUploadImage([file], (percent) => {
          const { tr } = view.state;
          view.state.doc.descendants((n, pos) => {
            if (n.type.name === "image" && n.attrs.alt === uploadId) {
              tr.setNodeMarkup(pos, undefined, {
                ...n.attrs,
                progress: percent,
              });
            }
          });
          if (tr.steps.length) view.dispatch(tr);
        }).then(([res]) => {
          const { tr } = view.state;
          view.state.doc.descendants((n, pos) => {
            if (n.type.name === "image" && n.attrs.alt === uploadId) {
              tr.setNodeMarkup(pos, undefined, {
                ...n.attrs,
                src: res.url,
                uploading: false,
                alt: "",
              });
            }
          });
          if (tr.steps.length) view.dispatch(tr);
        });

        return true;
      }

      return false;
    },
  },
});

/** Image Node */
export const Image = Node.create<ImageOptions>({
  name: "image",

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
      enableZoom: true,
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      uploading: { default: false },
      progress: { default: 0 },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const style: string[] = [];
    if (HTMLAttributes.width) style.push(`width: ${HTMLAttributes.width}px;`);
    if (HTMLAttributes.height)
      style.push(`height: ${HTMLAttributes.height}px;`);
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "tiptap-image",
        style: style.join(" "),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },

  addCommands() {
    return {
      setImage:
        (options) =>
          ({ commands }) =>
            commands.insertContent({ type: this.name, attrs: options }),
      updateImageSize:
        (attrs) =>
          ({ commands }) =>
            commands.updateAttributes(this.name, attrs),
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match;
          return { src, alt, title };
        },
      }),
      nodeInputRule({
        find: imageUrlRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, src] = match;
          return { src: src.trim(), alt: "" };
        },
      }),
    ];
  },

  addPasteRules(): PasteRule[] {
    return [];
  },

  addProseMirrorPlugins() {
    return [imageUploadPlugin];
  },
});
