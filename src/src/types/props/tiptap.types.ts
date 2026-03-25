import type { Editor, Range } from "@tiptap/core";
import { LucideIcon } from "lucide-react";

export interface Group {
  name: string;
  title: string;
  commands: Command[];
}

export interface Command {
  name: string;
  label: string;
  description?: string;
  aliases?: string[];
  iconName?: any;
  icon?: LucideIcon;
  action: ({ editor, range }: { editor: Editor; range: Range }) => void;
  shouldBeHidden?: (editor: Editor) => boolean;
  selected?: boolean;
}

export interface MenuListProps {
  editor: Editor;
  items: Group[];
  command: (command: Command) => void;
}
