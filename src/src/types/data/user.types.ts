import { Title } from "./title.types";

export type User = {
  id: number;
  code: string;
  name: string;
  email: string;
  password: string;
  title_id?: number;
  createrd_at?: string;
  updated_at?: string;
  division_id?: number;
  has_title?: Title;
  has_roles?: any;
  has_squads?: any;
  has_backlog_items?: any;
  has_divisions?: any;
  has_case_reports?: any;
  is_password_default?: boolean;
  deleted_at?: string | null;
  workspace?: string;
};

