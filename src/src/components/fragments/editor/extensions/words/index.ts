import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";

export interface WordNodeOptions {
  dictionary: Record<string, Record<string, string>>;
  defaultLocale: string;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    wordNode: {
      setLocale: (locale: string) => ReturnType;
      setWord: (key: string) => ReturnType;
      unsetWord: () => ReturnType;
    };
  }

  interface EditorStorage {
    wordNode: {
      locale: string;
    };
  }
}

export const inputRegex = /\{(\w+(?:\.\w+)*)\}/;

export const WordNode = Node.create<WordNodeOptions>({
  name: "wordNode",

  group: "inline",
  inline: true,
  atom: true,

  addOptions() {
    return {
      dictionary: {},
      defaultLocale: "en",
      HTMLAttributes: {},
    };
  },

  addStorage() {
    return {
      locale: this.options.defaultLocale,
    };
  },

  addAttributes() {
    return {
      key: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-word"),
        renderHTML: (attributes) => ({
          "data-word": attributes.key,
        }),
      },
      locale: {
        default: this.options.defaultLocale,
        parseHTML: (element) => element.getAttribute("data-locale"),
        renderHTML: (attributes) => ({
          "data-locale": attributes.locale,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-word]",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const dict = this.options.dictionary || {};
    // Gunakan locale dari node attribute (bukan dari storage)
    const locale = node.attrs.locale;
    const key = node.attrs.key;

    const word = dict[key]?.[locale] || key;

    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "word-node",
      }),
      word,
    ];
  },

  renderText({ node }) {
    const dict = this.options.dictionary || {};
    // Gunakan locale dari node attribute (bukan dari storage)
    const locale = node.attrs.locale;
    const key = node.attrs.key;

    return dict[key]?.[locale] || key;
  },

  addCommands() {
    return {
      setLocale:
        (locale: string) =>
        ({ editor }) => {
          // Hanya update storage locale untuk wordNode baru
          (this.storage as { locale: string }).locale = locale;

          // Force re-render (optional, jika perlu visual update)
          const { state, view } = editor;
          const { tr } = state;
          tr.setMeta("forceUpdate", true);
          view.dispatch(tr);

          return true;
        },

      setWord:
        (key: string) =>
        ({ editor, commands }) => {
          const { state, view } = editor;
          const { selection } = state;
          const { from } = selection;

          const $pos = state.doc.resolve(from);
          const textBefore = $pos.parent.textBetween(
            0,
            $pos.parentOffset,
            undefined,
            "\ufffc"
          );

          const triggerIndex = Math.max(
            textBefore.lastIndexOf("{"),
            textBefore.lastIndexOf("$")
          );

          const locale = (this.storage as { locale: string }).locale;

          if (triggerIndex !== -1) {
            const startPos = from - (textBefore.length - triggerIndex);
            editor
              .chain()
              .focus()
              .deleteRange({ from: startPos, to: from })
              .insertContent({
                type: this.name,
                attrs: { key, locale },
              })
              .run();
            return true;
          }

          return commands.insertContent({
            type: this.name,
            attrs: { key, locale },
          });
        },

      unsetWord:
        () =>
        ({ commands, state }) => {
          const { from, to } = state.selection;
          const { doc } = state;

          let foundWordNode = false;
          doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === this.name) {
              foundWordNode = true;
              const dict = this.options.dictionary || {};
              // Gunakan locale dari node attribute
              const locale = node.attrs.locale;
              const key = node.attrs.key;
              const word = dict[key]?.[locale] || key;

              commands.insertContentAt(
                { from: pos, to: pos + node.nodeSize },
                { type: "text", text: word }
              );
            }
          });

          return foundWordNode;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-W": () => this.editor.commands.setWord("app.login"),
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const locale = (this.storage as { locale: string }).locale;
          return { key: match[1], locale };
        },
      }),
    ];
  },
});
