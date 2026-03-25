import { Project } from "./project.types";

export type Product = {
  id: number;
  name: string;
  project_id: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
};
