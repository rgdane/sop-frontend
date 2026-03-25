import type { User } from "./user.types"; // Pastikan kamu punya tipe User juga

export type Notification = {
  id: number;
  user_origin_id: number;
  user_target_id: number[];
  title: string;
  content: string;
  read_by_users: number[];
  priority: "urgent" | "important" | "warning" | "info";
  created_at: string;
  updated_at: string;
  url: string;

  has_user_origin?: User;
  has_user_target?: User;
};
