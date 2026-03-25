import { Project } from "./project.types";
import { User } from "./user.types";

export interface Squad {
  id: number;
  name: string;
  project_id?: number;
  code?: string;
  created_at?: string;
  updated_at?: string;
  users?: User[];
  projects?: Project[];
  squad_members?: User[];
}
