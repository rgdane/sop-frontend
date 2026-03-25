import { JSONContent } from "@tiptap/core";

export type SprintDaily = {
  id: number;
  kendala: JSONContent;
  squad_id: number;
  user_id: number;
  created_at?: string;
  updated_at?: string;
};
