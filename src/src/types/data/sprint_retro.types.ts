import { JSONContent } from "@tiptap/core";

export type SprintRetro = {
  id: number;
  name: string;
  squad_id: number;
  has_squad?: any;
  has_retro_items?: any[];
  created_at?: string;
  updated_at?: string;
};
