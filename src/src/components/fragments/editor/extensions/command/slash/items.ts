import { localeActions } from "@/components/fragments/editor/locales";
import {
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Code,
  ListOrdered,
  Table,
  Upload,
  CheckSquare,
} from "lucide-react";
import { Group } from "@/types/props/tiptap.types";
import type { Extensions } from "@tiptap/core";
import type { HeadingOptions } from "@tiptap/extension-heading";

export function slashMenuItems(extensions: Extensions) {
  const groups: Group[] = [
    {
      name: "format",
      title: "Inline Text",
      commands: [],
    },
    {
      name: "insert",
      title: "Insert Node",
      commands: [],
    },
  ];

  const headingIcons = {
    1: Heading1,
    2: Heading2,
    3: Heading3,
  };

  extensions.forEach((extension) => {
    if (extension.name.toLowerCase() === "heading") {
      extension.options.levels.forEach(
        (level: HeadingOptions["levels"][number]) => {
          if (level === 1 || level === 2 || level === 3) {
            groups[0].commands.push({
              name: `heading${level}`,
              label: localeActions.t(`editor.heading.h${level}.tooltip`),
              aliases: [`h${level}`, "bt", `bt${level}`],
              icon: headingIcons[level],
              description: `Heading level ${level}`,
              action: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setHeading({ level })
                  .run();
              },
            });
          }
        }
      );
    }

    if (extension.name.toLowerCase() === "paragraph") {
      groups[0].commands.push({
        name: "paragraph",
        label: localeActions.t("editor.paragraph.tooltip"),
        aliases: ["ul", "yxlb"],
        icon: Pilcrow,
        description: "Create a simple text",
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setNode("paragraph").run();
        },
      });
    }

    if (extension.name.toLowerCase() === "codeblock") {
      groups[0].commands.push({
        name: "codeblock",
        label: localeActions.t("editor.codeblock.tooltip"),
        icon: Code,
        description: "Capture a code snippet",
        action: ({ editor }) => {
          editor.commands.setCodeBlock();
        },
      });
    }

    if (extension.name.toLowerCase() === "orderedlist") {
      groups[0].commands.push({
        name: "orderedlist",
        label: localeActions.t("editor.orderedlist.tooltip"),
        aliases: ["ol", "yxlb"],
        icon: ListOrdered,
        description: "Create an ordered list",
        action: ({ editor }) => {
          editor.commands.toggleOrderedList();
        },
      });
    }

    if (extension.name.toLowerCase() === "tasklist") {
      groups[0].commands.push({
        name: "tasklist",
        label: localeActions.t("editor.tasklist.tooltip"),
        aliases: ["tl", "checklist", "todo"],
        icon: CheckSquare,
        description: "Create a task list",
        action: ({ editor }) => {
          editor.commands.toggleTaskList();
        },
      });
    }

    if (extension.name.toLowerCase() === "table") {
      groups[1].commands.push({
        name: "table",
        label: localeActions.t("editor.table.tooltip"),
        icon: Table,
        description: "Insert a 3×3 table",
        action: ({ editor, range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
        },
      });
    }

    if (extension.name.toLowerCase() === "media") {
      groups[1].commands.push({
        name: "media",
        label: "Media",
        icon: Upload,
        description: "Insert an media block",
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).insertMedia().run();
        },
      });
    }

    if (extension.name.toLowerCase() === "details") {
      groups[1].commands.push({
        name: "details",
        label: "Detail",
        icon: Upload,
        description: "Insert an detail",
        action: ({ editor, range }) => {
          editor.chain().focus().deleteRange(range).setDetails().run();
        },
      });
    }
  });

  return groups;
}
