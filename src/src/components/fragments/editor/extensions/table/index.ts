import { Table } from "@tiptap/extension-table";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node as ProseMirrorNode } from "prosemirror-model";

interface TableWithSaveOptions {
  endpoint: string; // URL endpoint untuk menyimpan
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

/**
 * Custom Table extension that adds a floating "Save" button
 */
export const TableWithSave = Table.extend<TableWithSaveOptions>({
  name: "tableWithSave",

  addOptions() {
    return {
      ...this.parent?.(),
      endpoint: "/api/save-table",
      onSuccess: (res) => console.log("Saved!", res),
      onError: (err) => console.error("Save failed", err),
    };
  },

  addProseMirrorPlugins() {
    const { editor } = this;
    const { endpoint, onSuccess, onError } = this.options;

    return [
      new Plugin({
        key: new PluginKey("tableSaveButton"),
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            const { selection } = state;
            const node = selection.$anchor.node();

            if (node.type.name !== "table") return null;

            const pos = selection.$anchor.before();
            const deco = Decoration.widget(pos, () => {
              const button = document.createElement("button");
              button.innerText = "💾 Save Table";
              button.style.position = "absolute";
              button.style.right = "0";
              button.style.top = "-32px";
              button.style.padding = "4px 8px";
              button.style.fontSize = "12px";
              button.style.background = "#34d399";
              button.style.border = "none";
              button.style.borderRadius = "4px";
              button.style.cursor = "pointer";
              button.style.color = "#fff";

              button.onclick = async (e) => {
                e.preventDefault();
                const html = editor.getHTML();
                try {
                  const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: html }),
                  });
                  const data = await res.json();
                  onSuccess?.(data);
                } catch (error) {
                  onError?.(error);
                }
              };

              return button;
            });
            return DecorationSet.create(state.doc, [deco]);
          },
        },
      }),
    ];
  },
});
