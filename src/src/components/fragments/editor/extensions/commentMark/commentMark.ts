// CommentMark.ts
import { Mark, mergeAttributes } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export interface CommentMarkOptions {
  HTMLAttributes: Record<string, any>
  onCommentClick?: (commentId: string) => void
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    commentMark: {
      setCommentMark: (attrs: { id: string; color?: string }) => ReturnType
      unsetCommentMark: () => ReturnType
    }
  }
}

export const CommentMark = Mark.create<CommentMarkOptions>({
  name: "commentMark",

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentClick: undefined,
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [{ tag: "span[data-comment-id]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-comment-id": HTMLAttributes.id,
        class: "comment-mark",
        style: `background-color: ${HTMLAttributes.color}; position: relative; padding: 2px 0; border-radius: 2px;`,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setCommentMark:
        (attrs) =>
          ({ chain }) => {
            return chain().setMark(this.name, attrs).run()
          },
      unsetCommentMark:
        () =>
          ({ chain }) => {
            return chain().unsetMark(this.name).run()
          },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("commentMarkDecoration"),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = []
            const { doc } = state

            doc.descendants((node, pos) => {
              const marks = node.marks.filter((mark) => mark.type.name === this.name)

              marks.forEach((mark) => {
                const from = pos
                const to = pos + node.nodeSize

                // Add comment icon at the end
                decorations.push(
                  Decoration.widget(to, () => {
                    const icon = document.createElement("span")
                    icon.className = "comment-icon"
                    icon.style.cssText = `
                      margin-left: 2px;
                      font-size: 16px;
                      opacity: 1;
                      pointer-events: none;
                    `
                    return icon
                  })
                )
              })
            })

            return DecorationSet.create(doc, decorations)
          },
          handleClick: (view, pos, event) => {
            const { doc } = view.state
            const $pos = doc.resolve(pos)
            const marks = $pos.marks()

            const commentMark = marks.find((mark) => mark.type.name === this.name)

            if (commentMark) {
              // Trigger comment popup
              if (this.options.onCommentClick) {
                this.options.onCommentClick(commentMark.attrs.id)
              }
              return true
            }

            return false
          },
        },
      }),
    ]
  },
})
