import { Spk } from "@/types/data/spk.types";

export type CreateSpkDto = {
  name: string;
  description: string;
  code: string;
  has_titles?: number[];
};

export type UpdateSpkDto = {
  name?: string;
  description?: string;
  code?: string;
  has_titles?: number[];
};

export type ResponseSpkDto = {
  data: Spk[];
  total?: number;
};
