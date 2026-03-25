import type { Editor } from "@tiptap/core";
import { Table as TableIcon } from "lucide-react";

// Tambahkan ini ke file items.ts Anda
export const databaseSlashCommand = {
    label: "Database",
    description: "Insert a database table from API",
    aliases: ["table", "db", "data", "grid"],
    icon: TableIcon,
    action: ({ editor, range }: { editor: Editor; range: any }) => {
        // Hapus slash command text
        editor.chain().focus().deleteRange(range).run();

        // Prompt user untuk table ID
        const tableId = prompt(
            "Enter table ID:",
            "4:02a85047-6beb-4080-8aec-672bb009dc97:749"
        );

        if (tableId) {
            editor
                .chain()
                .focus()
                .insertDatabase({
                    tableId,
                    apiEndpoint: "http://localhost:5000/api/v1/graphs/",
                })
                .run();
        }
    },
    shouldBeHidden: (editor: Editor) => {
        // Check if database extension is available
        return !editor.commands.insertDatabase;
    },
};

// Atau versi tanpa prompt (langsung insert dengan ID default)
export const databaseSlashCommandQuick = {
    label: "Database",
    description: "Insert a database table",
    aliases: ["table", "db", "data"],
    icon: TableIcon,
    action: ({ editor, range }: { editor: Editor; range: any }) => {
        editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertDatabase({
                tableId: "4:02a85047-6beb-4080-8aec-672bb009dc97:749",
                apiEndpoint: "http://localhost:5000/api/v1/graphs/",
            })
            .run();
    },
    shouldBeHidden: (editor: Editor) => {
        return !editor.commands.insertDatabase;
    },
};
