import { Epic } from "./epic.types";

export type Feature = {
  id: number;
  name: string;
  epic_id: number;
  createdAt: string;
  updatedAt: string;
  epic?: Epic;
};
