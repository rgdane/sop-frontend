import { JSONContent } from "@tiptap/core";

export type Sprint = {
  id: number;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  total_estimate: number;
  kendala: JSONContent;
  squad_id: number;
  created_at?: string;
  updated_at?: string;
  generate_qty: number;
};
