// components/comments/types.ts
import { JSONContent } from "@tiptap/react";

export interface Comment {
  id: number;
  table_ref: string;
  table_ref_id: number | undefined;
  user: {
    id: number;
    name: string;
  };
  createdAt: string;
  content: JSONContent;
  replies?: Comment[];
  parentId?: number;
}
