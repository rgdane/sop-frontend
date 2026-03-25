import Text from "@tiptap/extension-text";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import HardBreak from "@tiptap/extension-hard-break";
import Dropcursor from "@tiptap/extension-dropcursor";
import SlashCommand from "./command/slash";
import { DocumentWithTitle, Title } from "./title";
import Collaboration from "@tiptap/extension-collaboration";
import Placeholder from "./Placeholder";
import { Gapcursor, UndoRedo } from "@tiptap/extensions";
import { TableKit } from "@tiptap/extension-table";
import Code from "@tiptap/extension-code";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import { BackgroundColor, TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "./lowlight";
import Youtube from "@tiptap/extension-youtube";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import { CustomCursor } from "./cursor/cursor";
import { Media } from "./media";
import CleanPasteExtension from "./plainListPaste";
import { Image } from "./image";
import { Database } from "./database";
import { Figma } from "./figma";
import { WordNode } from "./words";
import DollarCommand from "./command/dollar";
import Document from "@tiptap/extension-document";
import { CommentMark } from "./commentMark/commentMark";
import { Editor } from "@tiptap/core";
import { Hyperlink } from "./hyperlink";
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'

interface EditorExtensionsProps {
  provider?: any;
  user?: any;
  ydoc?: Y.Doc;
  awareness?: Awareness | null;
  dictionary?: any;
  useTitle?: boolean;
  usePlaceholder?: boolean;
  Editor?: Editor;
  onEditLink?: (url: string, text: string) => Promise<{ url: string; text: string } | null>;
}

const lowlight = createLowlight();
lowlight.register(common);

export const EditorExtensions = ({
  provider,
  Editor,
  user,
  ydoc,
  awareness,
  dictionary = {},
  usePlaceholder = true,
  useTitle = true,
  onEditLink,
}: EditorExtensionsProps) => {
  const extensions = [
    UndoRedo,
    Media,
    CleanPasteExtension,
    ...(useTitle ? [DocumentWithTitle, Title] : [Document]),
    Bold,
    Italic,
    Database,
    Underline,
    Code,
    Strike,
    Highlight,
    TextStyle,
    BackgroundColor,
    Color,
    Subscript,
    Superscript,
    Paragraph,
    HorizontalRule,
    CommentMark,
    Youtube,
    Details.configure({
      HTMLAttributes: {
        class: 'details',
      },
    }),
    DetailsSummary,
    DetailsContent,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    Hyperlink.configure({
      onEditLink: onEditLink || undefined,
    }),
    Image.configure({
      allowBase64: true,
      enableZoom: true,
    }),
    Figma,
    Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    CodeBlockLowlight.configure({ lowlight }),
    Blockquote,
    BulletList,
    OrderedList,
    ListItem,
    HardBreak,
    Text,
    SlashCommand,
    Gapcursor,
    Dropcursor.configure({
      color: "#da5a4c",
      class: "drop-cursor",
    }),
    TableKit.configure({
      table: { resizable: true },
    }),
    ...(usePlaceholder ? [Placeholder.configure({
      placeholder: ({ node }: any) => {
        switch (node.type.name) {
          case "title":
            return "Untitled";
          case "heading":
            return "Heading";
          case "codeBlock":
            return "Write code ...";
          case "detailsSummary":
            return "Summary"
          case "details":
            return null;
          default:
            return "Write something… or type '/'";
        }
      },
      showOnlyCurrent: false,
      includeChildren: true,
    })] : [])
  ];

  if (ydoc) {
    extensions.push(
      Collaboration.configure({
        document: ydoc,
      })
    );
  }

  if (awareness && user) {
    extensions.push(
      CustomCursor.configure({
        awareness,
        user,
      })
    );
  }

  return extensions;
};