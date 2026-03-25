import { ReactRenderer } from "@tiptap/react";
import MentionList, { MentionListRef } from "./MentionList";
import tippy, { Instance as TippyInstance } from "tippy.js";

interface User {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
}

export const createSuggestion = (users: User[]) => {
  return {
  items: ({ query }: { query: string }) => {
    if (!users || users.length === 0) {
      return [];
    }

    const filtered = users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, 5);
      
    return filtered;
  },

  render: () => {
    let component: ReactRenderer | null = null;
    let popup: TippyInstance | null = null;
    let isDestroyed = false;

    return {
      onStart: (props: any) => {
        isDestroyed = false;
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;

        popup = tippy(document.body, {
          getReferenceClientRect: () => props.clientRect(),
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
          theme: "light-border",
          animation: false,
          hideOnClick: true,
          zIndex: 10000, // Higher than Ant Design Modal (typically 1000)
          onClickOutside: () => {
            popup?.hide();
          },
          onHide: () => {
            if (isDestroyed) return;

            isDestroyed = true;

            component?.destroy();
            popup?.destroy();

            component = null;
            popup = null;
          },
          offset: [0, 8],
          popperOptions: {
            modifiers: [
              {
                name: "flip",
                options: {
                  fallbackPlacements: ["top-start", "bottom-start"],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  boundary: "viewport",
                  padding: 8,
                },
              },
            ],
          },
        }) as TippyInstance;
      },
      onUpdate(props: any) {
        if (component) {
          component.updateProps(props);

          if (!props.clientRect || !popup) {
            return;
          }

          popup.setProps({
            getReferenceClientRect: () => props.clientRect(),
          });
        }
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup?.hide();
          return true;
        }

        const mentionRef = component?.ref as MentionListRef | null;
        return mentionRef?.onKeyDown(props) || false;
      },

      onExit() {
        popup?.hide();
      },
    };
  },
  };
};

// Default export untuk backward compatibility
export default createSuggestion;
