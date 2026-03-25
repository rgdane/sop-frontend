import { JSONContent } from "@tiptap/core";
import { User } from "./user.types";

export interface Comment {
  id: number;
  table_ref: string;
  table_ref_id: number;
  user_id: number;
  content: JSONContent;
  parent: number | null;
  created_at: string;
  updated_at: string;
  children: Comment[] | null;
  comment_parent: Comment | null;
  has_user: User;
}
