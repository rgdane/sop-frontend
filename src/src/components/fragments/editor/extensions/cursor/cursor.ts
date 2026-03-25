import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { DecorationAttrs } from "@tiptap/pm/view";
import { Awareness } from "y-protocols/awareness";

type CustomCursorStorage = {
  users: { clientId: number;[key: string]: any }[];
};

export interface CustomCursorOptions {
  /**
   * The awareness instance
   */
  awareness: Awareness | null;

  /**
   * The user details object
   */
  user: Record<string, any>;

  /**
   * Function to render cursor element
   */
  render(user: Record<string, any>): HTMLElement;

  /**
   * Function to render selection
   */
  selectionRender(user: Record<string, any>): DecorationAttrs;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customCursor: {
      /**
       * Update current user details
       */
      updateUser: (attributes: Record<string, any>) => ReturnType;
    };
  }

  interface Storage {
    customCursor: CustomCursorStorage;
  }
}

const awarenessStatesToArray = (states: Map<number, Record<string, any>>) => {
  return Array.from(states.entries()).map(([key, value]) => {
    return {
      clientId: key,
      ...value.user,
    };
  });
};

const defaultCursorRender = (user: Record<string, any>): HTMLElement => {
  const cursor = document.createElement("span");
  cursor.classList.add("custom-cursor__caret");
  cursor.setAttribute(
    "style",
    `
    position: absolute;
    border-left: 2px solid ${user.color || "#ff6b6b"};
    border-right: 2px solid ${user.color || "#ff6b6b"};
    margin-left: -2px;
    margin-right: -2px;
    pointer-events: none;
    height: 1.2em;
    z-index: 10;
  `
  );

  const label = document.createElement("div");
  label.classList.add("custom-cursor__label");
  label.setAttribute(
    "style",
    `
    position: absolute;
    top: -20px;
    left: -2px;
    background-color: ${user.color || "#ff6b6b"};
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    z-index: 11;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `
  );

  label.textContent = user.name || "Anonymous";
  cursor.appendChild(label);

  return cursor;
};

const defaultSelectionRender = (user: Record<string, any>): DecorationAttrs => {
  return {
    class: "custom-cursor__selection",
    style: `background-color: ${user.color || "#ff6b6b"
      }20; border-radius: 2px;`,
  };
};

/**
 * Custom Cursor Extension - shows collaborative cursors and selections
 */
export const CustomCursor = Extension.create<
  CustomCursorOptions,
  CustomCursorStorage
>({
  name: "customCursor",

  priority: 999,

  addOptions() {
    return {
      awareness: null,
      user: {
        name: "Anonymous",
        color: "#ff6b6b",
      },
      render: defaultCursorRender,
      selectionRender: defaultSelectionRender,
    };
  },

  addStorage() {
    return {
      users: [],
    };
  },

  addCommands() {
    return {
      updateUser: (attributes) => () => {
        this.options.user = { ...this.options.user, ...attributes };

        if (this.options.awareness) {
          try {
            this.options.awareness.setLocalStateField(
              "user",
              this.options.user
            );
          } catch (error) {
            console.error("❌ Failed to update user in awareness:", error);
          }
        }

        return true;
      },
    };
  },

  onCreate() {
    if (!this.options.awareness) {
      console.warn("CustomCursor: No awareness instance provided");
      return;
    }

    try {
      this.options.awareness.setLocalStateField("user", this.options.user);
    } catch (error) {
      console.error("❌ Failed to initialize custom cursor:", error);
    }
  },

  addProseMirrorPlugins() {
    const { awareness } = this.options;

    if (!awareness) {
      return [];
    }

    return [
      new Plugin({
        key: new PluginKey("customCursor"),

        state: {
          init() {
            return DecorationSet.empty;
          },

          apply: (tr, decorationSet, oldState, newState) => {
            // Update current user's selection in awareness
            const { selection } = newState;
            const { from, to } = selection;

            try {
              awareness.setLocalStateField("selection", {
                anchor: from,
                head: to,
                timestamp: Date.now(),
              });
            } catch (error) {
              console.warn("Failed to update selection in awareness:", error);
            }

            // Create decorations for other users' cursors and selections
            const decorations: Decoration[] = [];
            const currentClientId = awareness.clientID;

            try {
              awareness.getStates().forEach((state, clientId) => {
                // Skip current user
                if (clientId === currentClientId) return;

                const user = state.user;
                const selection = state.selection;

                if (!user || !selection) return;

                const { anchor, head } = selection;

                // Only show if selection is within document bounds
                if (
                  anchor < 0 ||
                  head < 0 ||
                  anchor > newState.doc.content.size ||
                  head > newState.doc.content.size
                ) {
                  return;
                }

                // Create selection decoration if there's a range
                if (anchor !== head) {
                  const from = Math.min(anchor, head);
                  const to = Math.max(anchor, head);

                  decorations.push(
                    Decoration.inline(
                      from,
                      to,
                      this.options.selectionRender(user),
                      {
                        inclusiveStart: false,
                        inclusiveEnd: false,
                      }
                    )
                  );
                }

                // Create cursor decoration at head position
                try {
                  decorations.push(
                    Decoration.widget(head, this.options.render(user), {
                      key: `cursor-${clientId}`,
                      side: head > anchor ? 1 : -1,
                    })
                  );
                } catch (error) {
                  console.warn("Failed to create cursor decoration:", error);
                }
              });
            } catch (error) {
              console.warn("Error creating decorations:", error);
            }

            return DecorationSet.create(newState.doc, decorations);
          },
        },

        props: {
          decorations(state) {
            return this.getState(state);
          },
        },

        view: () => {
          // Update storage when awareness changes
          const updateUsers = () => {
            try {
              this.storage.users = awarenessStatesToArray(
                awareness.getStates()
              );
            } catch (error) {
              console.warn("Error updating users storage:", error);
            }
          };

          // Initial update
          updateUsers();

          // Listen for awareness updates
          awareness.on("update", updateUsers);

          return {
            destroy: () => {
              awareness.off("update", updateUsers);

              // Clean up awareness state
              try {
                awareness.setLocalStateField("user", null);
                awareness.setLocalStateField("selection", null);
              } catch (error) {
                console.warn("Error cleaning up awareness on destroy:", error);
              }
            },
          };
        },
      }),
    ];
  },

  onDestroy() {
    if (this.options.awareness) {
      try {
        this.options.awareness.setLocalStateField("user", null);
        this.options.awareness.setLocalStateField("selection", null);
      } catch (error) {
        console.warn(
          "Error cleaning up awareness on extension destroy:",
          error
        );
      }
    }
  },
});
