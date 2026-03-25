import { mergeAttributes, Node, nodeInputRule, PasteRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Plugin } from "prosemirror-state";
import { FigmaNodeView } from "./FigmaNode";

/** Node options */
export interface FigmaOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
}

/** Commands options */
export interface SetFigmaOptions {
  url: string;
  title?: string;
  width?: number;
  height?: number;
  isEmbedded?: boolean;
}

/** Add commands type */
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figma: {
      setFigma: (options: SetFigmaOptions) => ReturnType;
      updateFigmaSize: (attrs: {
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}

/** Regex for Figma URLs */
export const figmaUrlRegex =
  /https:\/\/(?:www\.)?figma\.com\/(?:file|design|proto|board)\/[a-zA-Z0-9_-]+[^\s)"]*/g;

/** Figma Node */
export const Figma = Node.create<FigmaOptions>({
  name: "figma",

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
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
      url: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: 800,
      },
      height: {
        default: 450,
      },
      isEmbedded: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[src*='figma.com/embed']",
        getAttrs: (node: string | HTMLElement) => {
          if (typeof node === "string") return false;
          const element = node as HTMLIFrameElement;
          return {
            url: element.getAttribute("src"),
            title: element.getAttribute("title") || "Figma Design",
            width: parseInt(element.getAttribute("width") || "800", 10),
            height: parseInt(element.getAttribute("height") || "450", 10),
            isEmbedded: true,
          };
        },
      },
      {
        tag: "div[data-figma-bookmark]",
        getAttrs: (node: string | HTMLElement) => {
          if (typeof node === "string") return false;
          const element = node as HTMLElement;
          return {
            url: element.getAttribute("data-url") || element.getAttribute("url"),
            title: element.getAttribute("data-title") || element.getAttribute("title") || "Figma Design",
            width: parseInt(element.getAttribute("width") || "800", 10),
            height: parseInt(element.getAttribute("height") || "450", 10),
            isEmbedded: false,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // If not embedded, render as bookmark card
    if (!HTMLAttributes.isEmbedded) {
      return [
        "div",
        mergeAttributes(HTMLAttributes, {
          "data-figma-bookmark": "true",
          "data-url": HTMLAttributes.url,
          "data-title": HTMLAttributes.title || "Figma Design",
        }),
        `📐 ${HTMLAttributes.title || "Figma Design"}`,
      ];
    }

    // If embedded, render as iframe
    return [
      "div",
      [
        "iframe",
        mergeAttributes(HTMLAttributes, {
          src: HTMLAttributes.url,
          width: HTMLAttributes.width || 800,
          height: HTMLAttributes.height || 450,
          style: "border: none; display: block; max-width: 100%;",
          allowfullscreen: "true",
          title: HTMLAttributes.title || "Figma embed",
        }),
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigmaNodeView);
  },

  addCommands() {
    return {
      setFigma:
        (options) =>
        ({ commands }) => {
          // Convert regular Figma URL to embed URL
          const embedUrl = convertToEmbedUrl(options.url);
          return commands.insertContent({
            type: this.name,
            attrs: {
              ...options,
              url: embedUrl,
              isEmbedded: options.isEmbedded ?? false, // Default to bookmark
            },
          });
        },
      updateFigmaSize:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: figmaUrlRegex,
        type: this.type,
        getAttributes: (match) => {
          const url = match[0];
          const embedUrl = convertToEmbedUrl(url);
          return {
            url: embedUrl,
            title: "Figma Design",
            width: 800,
            height: 450,
            isEmbedded: false, // Default to bookmark
          };
        },
      }),
    ];
  },

  addPasteRules(): PasteRule[] {
    return []; // handled by plugin
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            const clipboardData = event.clipboardData;
            if (!clipboardData) return false;

            const text = clipboardData.getData("text/plain");
            if (!text) return false;

            const match = text.match(figmaUrlRegex);
            if (match) {
              const embedUrl = convertToEmbedUrl(match[0]);
              const { state, dispatch } = view;

              const node = state.schema.nodes.figma.create({
                url: embedUrl,
                title: "Figma Design",
                width: 800,
                height: 450,
                isEmbedded: false, // Default to bookmark
              });

              const tr = state.tr.replaceSelectionWith(node);
              dispatch(tr);
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

/**
 * Convert regular Figma URL to embed URL
 * @param url - Original Figma URL
 * @returns Embed URL
 */
function convertToEmbedUrl(url: string): string {
  if (url.includes("figma.com/embed")) {
    return url; // sudah embed
  }

  const encodedUrl = encodeURIComponent(url);
  return `https://www.figma.com/embed?embed_host=share&url=${encodedUrl}`;
}
