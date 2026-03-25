import { Division } from "./division.types";
import d from 'highlight.js/lib/languages/d';

export type Position = {
  id: number;
  name: string;
  code: string;
  color: string;
  division_id: number;
  created_at?: string;
  updated_at?: string;
  division?: Division;
  deleted_at?: string | null;
};
