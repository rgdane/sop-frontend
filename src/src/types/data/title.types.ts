import { Department } from "./department.types";
import { Level } from "./level.types";
import { Position } from "./position.types";

export type Title = {
  id: number;
  code: string;
  name: string;
  level_id: number;
  color: string;
  position_id: number;
  created_at?: string;
  updated_at?: string;
  level?: Level;
  position?: Position;
  department?: Department;
  deleted_at?: string | null;
};
