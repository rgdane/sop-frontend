import { Squad } from "./squad.types";

export type Project = {
  id: number;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  team?: Squad[];
};

export type ProjectUsers = {
  id: number;
  name: string;
};
