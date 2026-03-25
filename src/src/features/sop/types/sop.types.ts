import { Sop } from "@/types/data/sop.types";

export type CreateSopDto = {
  name: string;
  description: string;
  code: string;
  division_id?: number;
  has_titles: number[];
  title?: number[];
};

export type ResponseSopDto = {
  data: Sop[];
  total?: number;
};

export type UpdateSopDto = {
  name?: string;
  description?: string;
  code?: string;
  division_id?: number;
  has_titles?: number[];
};
