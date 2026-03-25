import { JSONContent } from "@tiptap/core";
import { User } from "./user.types";

export interface HistoryChanges {
  [key: string]: {
    old: any;
    new: any;
  };
}

export interface History {
  id: number;
  user_id: number;
  table_ref: string;
  table_ref_id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  message: string;
  user_agent: string;
  origins: string;
  old_data: any;
  new_data: any;
  changes: HistoryChanges | null;
  created_at: string;
  user?: User | null;
}
