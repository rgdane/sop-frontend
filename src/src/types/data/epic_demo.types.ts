import { Epic } from "./epic.types";

export type EpicDemo = {
  id: number;
  name: string;
  position_id: string;
  priority: "High" | "Medium" | "Low";
  status: "To-Do" | "In Progress" | "Done";
  index: number;
  parent_id?: number | null;
  children?: Epic[];
  created_at?: string;
  updated_at?: string;
};
