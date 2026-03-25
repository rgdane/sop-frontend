import {
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Code,
  Languages,
} from "lucide-react";
import { Group } from "@/types/props/tiptap.types";
import type { Extensions } from "@tiptap/core";

export function wordListItem(extensions: Extensions, dictionary: any) {
  const groups: Group[] = [
    {
      name: "language",
      title: "Pilih Bahasa",
      commands: [],
    },
    {
      name: "words",
      title: "Diksi Kata",
      commands: [],
    },
  ];

  groups[0].commands.push({
    name: "id-lang",
    label: "Indonesian",
    icon: Languages,
    action: ({ editor }) => {
      if (editor?.isDestroyed || !editor?.view?.state) return;
      (editor.commands as any).setLocale("id");
    },
  });

  groups[0].commands.push({
    name: "en-lang",
    label: "English",
    icon: Languages,
    action: ({ editor }) => {
      if (editor?.isDestroyed || !editor?.view?.state) return;
      (editor.commands as any).setLocale("en");
    },
  });

  for (const key in dictionary) {
    groups[1].commands.push({
      name: key,
      label: key,
      icon: Pilcrow,
      action: ({ editor }) => {
        if (editor?.isDestroyed || !editor?.view?.state) return;
        (editor.commands as any).setWord(key);
      },
    });
  }

  return groups;
}
