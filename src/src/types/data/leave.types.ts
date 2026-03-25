import { User } from "./user.types";

export type Leave = {
  id: number;
  user_id?: number;
  date: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
};