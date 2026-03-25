import { JSONContent } from "@tiptap/core";

export type RetroItem = {
  id: number;
  text: string;
  user: string;
  vote: number;
  color: string;
  sprint_retro_id: number;
  sprint_id: number;
  has_sprint_retro?: any;
  has_sprint?: any;
  created_at?: string;
  updated_at?: string;
};
