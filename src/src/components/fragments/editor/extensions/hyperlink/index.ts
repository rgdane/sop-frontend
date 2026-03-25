import { Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface LinkOptions {
    openOnClick: boolean;
    HTMLAttributes: Record<string, any>;
    onEditLink?: (url: string, text: string) => Promise<{ url: string; text: string } | null>;
}

// Create tooltip element
let tooltip: HTMLDivElement | null = null;
let currentLink: HTMLElement | null = null;
let hideTimeout: number | null = null;

function createTooltip() {
    if (tooltip) return tooltip;

    tooltip = document.createElement('div');
    tooltip.className = 'link-tooltip';
    tooltip.style.cssText = `
        position: absolute;
        z-index: 9999;
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 13px;
        display: none;
        pointer-events: auto;
        white-space: nowrap;
        gap: 8px;
        align-items: center;
    `;

    const openButton = document.createElement('button');
    openButton.textContent = '🔗 Buka Link';
    openButton.className = 'open-link-btn';
    openButton.style.cssText = `
        background: #ff6757;
        color: white;
        border: none;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: background 0.2s;
    `;
    openButton.onmouseover = () => {
        openButton.style.background = '#ff6757cc';
    };
    openButton.onmouseout = () => {
        openButton.style.background = '#ff6757';
    };

    tooltip.appendChild(openButton);

    // Handle mouse leave from tooltip
    tooltip.onmouseleave = () => {
        hideTimeout = window.setTimeout(hideTooltip, 200);
    };

    tooltip.onmouseenter = () => {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    };

    document.body.appendChild(tooltip);

    return tooltip;
}

function showTooltip(link: HTMLElement, href: string) {
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }

    const tt = createTooltip();
    const openBtn = tt.querySelector('.open-link-btn') as HTMLButtonElement;

    currentLink = link;

    // Update click handler
    openBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(href, '_blank');
        hideTooltip();
    };

    const rect = link.getBoundingClientRect();
    tt.style.display = 'flex';
    tt.style.left = `${rect.left + window.scrollX}px`;
    tt.style.top = `${rect.bottom + window.scrollY + 5}px`;
}

function hideTooltip() {
    if (tooltip) {
        tooltip.style.display = 'none';
    }
    currentLink = null;
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }
}

export const Hyperlink = Mark.create<LinkOptions>({
    name: 'link',

    priority: 1000,

    keepOnSplit: false,

    onCreate() {
        this.options.openOnClick = false;
    },

    addOptions() {
        return {
            openOnClick: false,
            HTMLAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer nofollow',
                class: 'custom-link',
            },
            onEditLink: undefined,
        };
    },

    addAttributes() {
        return {
            href: {
                default: null,
            },
            target: {
                default: this.options.HTMLAttributes.target,
            },
            rel: {
                default: this.options.HTMLAttributes.rel,
            },
            class: {
                default: this.options.HTMLAttributes.class,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'a[href]:not([href *= "javascript:" i])',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setLink:
                (attributes) =>
                    ({ chain }) => {
                        return chain().setMark(this.name, attributes).setMeta('preventAutolink', true).run();
                    },

            toggleLink:
                (attributes) =>
                    ({ chain }) => {
                        return chain()
                            .toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
                            .setMeta('preventAutolink', true)
                            .run();
                    },

            unsetLink:
                () =>
                    ({ chain }) => {
                        return chain()
                            .unsetMark(this.name, { extendEmptyMarkRange: true })
                            .setMeta('preventAutolink', true)
                            .run();
                    },
        };
    },

    addPasteRules() {
        return [
            {
                find: (text) => {
                    const urlRegex = /https?:\/\/[^\s]+/g;
                    const matches = [];
                    let match;

                    while ((match = urlRegex.exec(text)) !== null) {
                        matches.push({
                            text: match[0],
                            index: match.index,
                            data: { href: match[0] },
                        });
                    }

                    return matches;
                },
                handler: ({ state, range, match }) => {
                    const { tr } = state;
                    const start = range.from;
                    const end = range.to;

                    if (start !== end) {
                        tr.addMark(
                            start,
                            end,
                            this.type.create({ href: match.data?.href })
                        );
                    }
                },
            },
        ];
    },

    addProseMirrorPlugins() {
        const { onEditLink } = this.options;

        return [
            // Handle space to unlink
            new Plugin({
                key: new PluginKey('handleSpaceUnlink'),
                props: {
                    handleTextInput: (view, from, to, text) => {
                        if (text === ' ') {
                            const { state } = view;
                            const { schema } = state;
                            const linkMark = schema.marks.link;

                            const $pos = state.doc.resolve(from);
                            const marks = $pos.marks();
                            const hasLinkMark = marks.some(mark => mark.type === linkMark);

                            if (hasLinkMark) {
                                const tr = state.tr;
                                tr.insertText(' ', from, to);
                                tr.removeMark(from, from + 1, linkMark);
                                tr.removeStoredMark(linkMark);
                                view.dispatch(tr);
                                return true;
                            }
                        }

                        return false;
                    },
                },
            }),

            new Plugin({
                key: new PluginKey('handleClickLink'),
                props: {
                    handleClick: (view, pos, event) => {
                        const { schema, doc } = view.state;
                        const attrs = this.editor.getAttributes('link');

                        if (!attrs.href) {
                            return false;
                        }

                        const link = (event.target as HTMLElement)?.closest('a');

                        if (!link) {
                            return false;
                        }

                        event.preventDefault();
                        event.stopPropagation();

                        const resolvedPos = doc.resolve(pos);
                        const linkMark = schema.marks.link;

                        // Find link boundaries
                        let linkFrom = pos;
                        let linkTo = pos;

                        // Find start of link
                        let tempPos = pos;
                        while (tempPos > 0) {
                            const $pos = doc.resolve(tempPos);
                            const marks = $pos.marks();
                            if (!marks.some(m => m.type === linkMark && m.attrs.href === attrs.href)) {
                                linkFrom = tempPos;
                                break;
                            }
                            tempPos--;
                            if (tempPos === 0) {
                                linkFrom = 0;
                            }
                        }

                        // Find end of link
                        tempPos = pos;
                        const docSize = doc.content.size;
                        while (tempPos < docSize) {
                            const $pos = doc.resolve(tempPos);
                            const marks = $pos.marks();
                            if (!marks.some(m => m.type === linkMark && m.attrs.href === attrs.href)) {
                                linkTo = tempPos;
                                break;
                            }
                            tempPos++;
                            if (tempPos === docSize) {
                                linkTo = docSize;
                            }
                        }

                        const linkText = doc.textBetween(linkFrom, linkTo);

                        hideTooltip();

                        if (onEditLink) {
                            onEditLink(attrs.href, linkText).then((result) => {

                                if (result) {
                                    const { url, text } = result;

                                    const tr = view.state.tr;

                                    if (url) {
                                        if (text && text !== linkText) {
                                            const newText = schema.text(text, [schema.marks.link.create({ href: url })]);
                                            tr.replaceWith(linkFrom, linkTo, newText);
                                        } else {
                                            tr.removeMark(linkFrom, linkTo, linkMark);
                                            tr.addMark(linkFrom, linkTo, schema.marks.link.create({ href: url }));
                                        }
                                    } else {
                                        tr.removeMark(linkFrom, linkTo, linkMark);
                                    }

                                    view.dispatch(tr);
                                }
                            });
                        }

                        return true;
                    },

                    handleDOMEvents: {
                        mouseover: (view, event) => {
                            const target = event.target as HTMLElement;
                            const link = target.closest('a');

                            if (link && link.hasAttribute('href')) {
                                const href = link.getAttribute('href');
                                if (href) {
                                    showTooltip(link as HTMLElement, href);
                                }
                            }

                            return false;
                        },
                        mouseout: (view, event) => {
                            const target = event.target as HTMLElement;
                            const link = target.closest('a');

                            if (link) {
                                hideTimeout = window.setTimeout(() => {
                                    if (!tooltip?.matches(':hover')) {
                                        hideTooltip();
                                    }
                                }, 200);
                            }

                            return false;
                        },
                    },
                },
            }),

            // Enhanced paste handler for URLs
            new Plugin({
                key: new PluginKey('autolinkPaste'),
                props: {
                    handlePaste: (view, event) => {
                        const { state } = view;
                        const { selection, schema } = state;
                        const { $from, $to, empty } = selection;

                        if (empty) {
                            return false;
                        }

                        const text = event.clipboardData?.getData('text/plain');

                        if (!text) {
                            return false;
                        }

                        const urlRegex = /^https?:\/\/[^\s]+$/;
                        const trimmedText = text.trim();

                        if (urlRegex.test(trimmedText)) {
                            event.preventDefault();

                            const tr = state.tr;
                            const from = $from.pos;
                            const to = $to.pos;

                            tr.addMark(
                                from,
                                to,
                                schema.marks.link.create({ href: trimmedText })
                            );

                            view.dispatch(tr);
                            return true;
                        }

                        return false;
                    },
                },
            }),
        ];
    },

    onDestroy() {
        if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
            tooltip = null;
        }
    },
});