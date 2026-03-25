import { JSONContent } from "@tiptap/react";
import { Squad } from "./squad.types";
import { User } from "./user.types";
import { BacklogItem } from "./backlog_item.types";

export type Backlog = {
  id: number;
  name: string;
  pic: number;
  squad_id: number;
  epic_id: number;
  code: string;
  description: JSONContent;
  priority: "Low" | "Medium" | "High";
  start_date: string;
  end_date: string;
  has_pic: User | null;
  has_squad: Squad | null;
  has_backlog_item: BacklogItem[] | null;
};
