export type CreateSopJobDto = {
  name: string;
  alias: string;
  description: string;
  step: string;
  output: string;
  sop_id: number;
  type: string;
  reference_id?: number;
  code?: string;
  has_positions?: Position[];
  index: number;
  url?: string;
  is_published?: boolean;
};

export type UpdateSopJobDto = {
  name?: string;
  alias?: string;
  description: string;
  step: string;
  output: string;
  sop_id: number;
  type: string;
  reference_id?: number;
  has_positions?: Position[];
  index?: number;
  url?: string;
  is_published?: boolean;
};


type Position = {
  id: number;
  name: string;
};

export type ReorderSopJobDto = {
  new_index: number;
  sop_id: number;
}