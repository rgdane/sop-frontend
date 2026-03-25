import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';


// Details Node
export const Details = Node.create({
    name: 'details',

    group: 'block',

    content: 'detailsSummary detailsContent',

    defining: true,

    isolating: true,

    addAttributes() {
        return {
            open: {
                default: false,
                parseHTML: element => element.classList.contains('is-open'),
                renderHTML: attributes => {
                    return attributes.open ? { class: 'is-open' } : {};
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="details"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'details',
                class: 'details',
            }),
            ['button', { type: 'button' }],
            ['div', 0],
        ];
    },

    addCommands() {
        return {
            setDetails:
                () =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            content: [
                                {
                                    type: 'detailsSummary',
                                    content: [
                                        {
                                            type: 'text',
                                            text: 'Summary',
                                        },
                                    ],
                                },
                                {
                                    type: 'detailsContent',
                                    content: [
                                        {
                                            type: 'paragraph',
                                        },
                                    ],
                                },
                            ],
                        });
                    },
            toggleDetails:
                () =>
                    ({ commands, state }: any) => {
                        const { selection } = state;
                        const node = state.doc.nodeAt(selection.from);

                        if (node && node.type.name === this.name) {
                            return commands.updateAttributes(this.name, {
                                open: !node.attrs.open,
                            });
                        }

                        return false;
                    },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Alt-d': () => this.editor.commands.setDetails(),
            'Backspace': ({ editor }) => {
                const { state } = editor;
                const { selection, doc } = state;
                const { $from } = selection;

                // Check if we're at the start of a details node
                if ($from.parent.type.name === 'detailsSummary' && $from.parentOffset === 0) {
                    const detailsPos = $from.before($from.depth - 1);
                    const detailsNode = doc.nodeAt(detailsPos);

                    if (detailsNode && detailsNode.type.name === 'details') {
                        return editor.commands.deleteNode('details');
                    }
                }

                return false;
            },
            'Enter': ({ editor }) => {
                const { state } = editor;
                const { selection } = state;
                const { $from } = selection;

                // Check if we're at the end of detailsContent
                if ($from.parent.type.name === 'paragraph' &&
                    $from.node($from.depth - 1).type.name === 'detailsContent') {
                    const detailsDepth = $from.depth - 2;
                    const detailsNode = $from.node(detailsDepth);

                    if (detailsNode && detailsNode.type.name === 'details') {
                        const detailsPos = $from.before(detailsDepth);
                        const detailsEnd = detailsPos + detailsNode.nodeSize;

                        // If at the end of details, insert paragraph after
                        if ($from.pos === detailsEnd - 3) {
                            return editor.commands.insertContentAt(detailsEnd, { type: 'paragraph' });
                        }
                    }
                }

                return false;
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('detailsClick'),
                props: {
                    handleDOMEvents: {
                        click: (view, event) => {
                            const target = event.target as HTMLElement;
                            const button = target.closest('.details button');

                            if (button) {
                                const detailsElement = button.closest('.details');
                                if (!detailsElement) return false;

                                // Find the position of the details node
                                const pos = view.posAtDOM(detailsElement, 0);
                                const node = view.state.doc.nodeAt(pos);

                                if (node && node.type.name === 'details') {
                                    const { tr } = view.state;
                                    tr.setNodeMarkup(pos, undefined, {
                                        ...node.attrs,
                                        open: !node.attrs.open,
                                    });
                                    view.dispatch(tr);

                                    event.preventDefault();
                                    return true;
                                }
                            }

                            return false;
                        },
                    },
                },
            }),
        ];
    },
});

// Details Summary Node
export const DetailsSummary = Node.create({
    name: 'detailsSummary',

    content: 'inline*',

    defining: true,

    parseHTML() {
        return [
            {
                tag: 'summary',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['summary', mergeAttributes(HTMLAttributes), 0];
    },
});

// Details Content Node
export const DetailsContent = Node.create({
    name: 'detailsContent',

    content: 'block+',

    defining: true,

    parseHTML() {
        return [
            {
                tag: 'div[data-type="detailsContent"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'detailsContent',
            }),
            0,
        ];
    },
});