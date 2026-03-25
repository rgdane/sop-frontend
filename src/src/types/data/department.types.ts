import { Division } from "./division.types";

export type Department = {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
  division?: Division[];
  deleted_at?: string | null;
};

