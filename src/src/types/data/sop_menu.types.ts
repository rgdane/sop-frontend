import { Division } from "./division.types";

export type SopMenu = {
  id: number;
  name: string;
  sop_id: number;
  project_id: number;
  division_id?: number;
  position_id?: number;
  parent_id?: number;
  master_id?: number;
  is_master?: boolean;
  type: string;
  multiple: boolean;
  has_sop: any;
  has_division?: Division;
  createdAt: string;
  updatedAt: string;
  template?: string;
};
