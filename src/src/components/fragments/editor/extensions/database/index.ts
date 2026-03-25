import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DatabaseNodeView } from './DatabaseNodeView';

export interface DatabaseOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        database: {
            /**
             * Insert a database node
             */
            insertDatabase: (attributes: {
                tableId: string;
                apiEndpoint?: string;
            }) => ReturnType;
        };
    }
}

export const Database = Node.create<DatabaseOptions>({
    name: 'database',

    group: 'block',

    atom: true,

    draggable: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            tableId: {
                default: null,
                parseHTML: element => element.getAttribute('data-table-id'),
                renderHTML: attributes => {
                    if (!attributes.tableId) {
                        return {};
                    }
                    return {
                        'data-table-id': attributes.tableId,
                    };
                },
            },
            apiEndpoint: {
                default: 'http://localhost:5000/api/v1/graphs/',
                parseHTML: element => element.getAttribute('data-api-endpoint'),
                renderHTML: attributes => {
                    if (!attributes.apiEndpoint) {
                        return {};
                    }
                    return {
                        'data-api-endpoint': attributes.apiEndpoint,
                    };
                },
            },
            // Simpan element ID untuk referensi
            elementId: {
                default: null,
                parseHTML: element => element.getAttribute('data-element-id'),
                renderHTML: attributes => {
                    if (!attributes.elementId) {
                        return {};
                    }
                    return {
                        'data-element-id': attributes.elementId,
                    };
                },
            },
            // Simpan nama table untuk display
            tableName: {
                default: null,
                parseHTML: element => element.getAttribute('data-table-name'),
                renderHTML: attributes => {
                    if (!attributes.tableName) {
                        return {};
                    }
                    return {
                        'data-table-name': attributes.tableName,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="database"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'database',
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(DatabaseNodeView);
    },

    addCommands() {
        return {
            insertDatabase:
                attributes =>
                    ({ chain }) => {
                        return chain()
                            .insertContent({
                                type: this.name,
                                attrs: attributes,
                            })
                            .run();
                    },
        };
    },
});

export default Database;