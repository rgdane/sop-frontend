import type { Editor, Range } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionProps,
} from "@tiptap/suggestion";
import Suggestion from "@tiptap/suggestion";
import tippy from "tippy.js";
import { slashMenuItems } from "./items";
import { getCurrentNodeCoordinates } from "../../../utils/tiptap-utils";
import CommandListNode from "./CommandListNode";

const extensionName = "slashCommand";
let popup: any;

export const SlashCommand = Extension.create({
  name: extensionName,
  priority: 200,

  onCreate() {
    popup = tippy("body", {
      interactive: true,
      trigger: "manual",
      placement: "bottom-start",
      theme: "slash-command",
      maxWidth: "16rem",
      offset: [0, 8],
      zIndex: 10000, // Higher than Ant Design Modal (typically 1000)
      getReferenceClientRect: () => {
        return new DOMRect(0, 0, 0, 0);
      },
      popperOptions: {
        strategy: "fixed",
        modifiers: [
          {
            name: "flip",
            enabled: true,
            options: {
              fallbackPlacements: ["top-start", "bottom-start", "right-start"],
            },
          },
          {
            name: "preventOverflow",
            enabled: true,
            options: {
              boundary: "viewport",
            },
          },
        ],
      },
    });
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowSpaces: true,
        startOfLine: true,
        pluginKey: new PluginKey(extensionName),
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const isRootDepth = $from.depth === 1;
          const isParagraph = $from.parent.type.name === "paragraph";
          const isStartOfNode = $from.parent.textContent?.charAt(0) === "/";
          const isInColumn = this.editor.isActive("column");
          const afterContent = $from.parent.textContent?.slice(
            Math.max(0, $from.parent.textContent?.indexOf("/"))
          );
          const isValidAfterContent = !afterContent?.endsWith("  ");

          return (
            ((isRootDepth && isParagraph && isStartOfNode) ||
              (isInColumn && isParagraph && isStartOfNode)) &&
            isValidAfterContent
          );
        },
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: any;
        }) => {
          const { view } = editor;
          props.action({ editor, range });
          view.focus();
        },
        items: ({ query, editor }: { query: string; editor: Editor }) => {
          const groups = slashMenuItems(editor.extensionManager.extensions);
          const withFilteredCommands = groups.map((group) => ({
            ...group,
            commands: group.commands
              .filter((item) => {
                const labelNormalized = item.label.toLowerCase().trim();
                const queryNormalized = query.toLowerCase().trim();

                if (item.aliases) {
                  const aliases = item.aliases.map((alias) =>
                    alias.toLowerCase().trim()
                  );
                  const labelMatch = labelNormalized.match(queryNormalized);
                  const aliasMatch = aliases.some((alias) =>
                    alias.match(queryNormalized)
                  );

                  return labelMatch || aliasMatch;
                }

                return labelNormalized.match(queryNormalized);
              })
              .filter((command) =>
                command.shouldBeHidden
                  ? !command.shouldBeHidden(this.editor)
                  : true
              ),
          }));
          const withoutEmptyGroups = withFilteredCommands.filter((group) => {
            if (group.commands.length > 0) {
              return true;
            }
            return false;
          });
          const withEnabledSettings = withoutEmptyGroups.map((group) => ({
            ...group,
            commands: group.commands.map((command) => ({
              ...command,
              isEnabled: true,
            })),
          }));

          return withEnabledSettings;
        },
        render: () => {
          let component: any;
          let scrollHandler: (() => void) | null = null;

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer(CommandListNode, {
                props,
                editor: props.editor,
              });

              const { view } = props.editor;

              const getReferenceClientRect = () => {
                const nodeCoords = getCurrentNodeCoordinates(props.editor);

                let rect: DOMRect;

                if (props.clientRect) {
                  const clientRect = props.clientRect();
                  if (clientRect) {
                    rect = clientRect;
                  } else {
                    const cursor = nodeCoords.cursor;
                    rect = new DOMRect(cursor.x, cursor.bottom, 0, 0);
                  }
                } else {
                  const storedRect = (props.editor.storage as any)[
                    extensionName
                  ].rect;
                  if (storedRect && storedRect.width > 0) {
                    rect = new DOMRect(
                      storedRect.left,
                      storedRect.top,
                      storedRect.width,
                      storedRect.height
                    );
                  } else {
                    const cursor = nodeCoords.cursor;
                    rect = new DOMRect(cursor.x, cursor.bottom, 0, 0);
                  }
                }

                let yPos = rect.y;
                const popupHeight = component.element.offsetHeight;
                const viewportHeight = window.innerHeight;
                const spaceBelow = viewportHeight - rect.bottom;
                const spaceAbove = rect.top;

                // If not enough space below and more space above, position above
                if (
                  spaceBelow < popupHeight + 40 &&
                  spaceAbove > popupHeight + 40
                ) {
                  yPos = rect.top - popupHeight - 8;
                }

                // Store the calculated rect for future reference
                (props.editor.storage as any)[extensionName].rect = {
                  x: rect.x,
                  y: yPos,
                  width: rect.width,
                  height: rect.height,
                  left: rect.x,
                  top: yPos,
                  right: rect.right,
                  bottom: yPos + rect.height,
                };

                return new DOMRect(rect.x, yPos, rect.width, rect.height);
              };

              scrollHandler = () => {
                popup?.[0].setProps({
                  getReferenceClientRect,
                });
              };

              view.dom.parentElement?.addEventListener("scroll", scrollHandler);

              popup?.[0].setProps({
                getReferenceClientRect,
                appendTo: () => document.body,
                content: component.element,
              });

              popup?.[0].show();
            },

            onUpdate(props: SuggestionProps) {
              component.updateProps(props);

              const { view } = props.editor;
              const nodeCoords = getCurrentNodeCoordinates(props.editor);

              const getReferenceClientRect = () => {
                if (props.clientRect) {
                  const rect = props.clientRect();
                  if (rect) {
                    return rect;
                  }
                }

                // Fallback to cursor position
                const cursor = nodeCoords.cursor;
                return new DOMRect(cursor.x, cursor.bottom, 0, 0);
              };

              const scrollHandler = () => {
                popup?.[0].setProps({
                  getReferenceClientRect,
                });
              };

              view.dom.parentElement?.addEventListener("scroll", scrollHandler);

              // Update stored rect
              (props.editor.storage as any)[extensionName].rect =
                props.clientRect
                  ? getReferenceClientRect()
                  : {
                    x: nodeCoords.cursor.x,
                    y: nodeCoords.cursor.bottom,
                    width: 0,
                    height: 0,
                    left: nodeCoords.cursor.x,
                    top: nodeCoords.cursor.bottom,
                    right: nodeCoords.cursor.right,
                    bottom: nodeCoords.cursor.bottom,
                  };

              popup?.[0].setProps({
                getReferenceClientRect,
              });
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === "Escape") {
                popup?.[0].hide();
                return true;
              }

              if (!popup?.[0].state.isShown) {
                popup?.[0].show();
              }

              return component.ref?.onKeyDown(props);
            },

            onExit(props) {
              popup?.[0].hide();
              if (scrollHandler) {
                const { view } = props.editor;
                view.dom.parentElement?.removeEventListener(
                  "scroll",
                  scrollHandler
                );
              }
              component.destroy();
            },
          };
        },
      }),
    ];
  },

  addStorage() {
    return {
      rect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      },
    };
  },
});

export default SlashCommand;
