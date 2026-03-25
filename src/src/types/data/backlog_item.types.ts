import { JSONContent } from "@tiptap/core";
import { Backlog } from "./backlog.types";
import { SprintGoal } from "./sprint_goal.types";
import { Status } from "./status.types";
import { User } from "./user.types";
import { Squad } from "./squad.types";

export type BacklogItem = {
  user: any;
  statusColor: string | undefined;
  status: string | undefined;
  id: number;
  name: string;
  code?: string;
  estimate: number;
  backlog_id: number;
  user_id?: number;
  sprint_id?: number;
  status_id?: number;
  start_date: string;
  end_date: string;
  draft: boolean;
  priority: "Low" | "Medium" | "High";
  description?: string;
  created_at?: string;
  updated_at?: string;
  has_user?: User | null;
  has_status?: Status | null;
  has_backlog?: Backlog | null;
  has_squad?: Squad | null;
  has_sprint_goal?: SprintGoal | null;
  evidence?: string | null
};

export type ReportBacklogItems = {
  id: number;
  user_id: number;
  name: string;
  to_do_count: number;
  in_progress_count: number;
  complete_count: number;
}