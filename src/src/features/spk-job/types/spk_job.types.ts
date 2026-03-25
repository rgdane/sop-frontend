export type CreateSpkJobDto = {
  name: string;
  description: string;
  spk_id: number;
  sop_id?: number;
  position_id?: number;
  index?: number;
  url?: string;
};

export type UpdateSpkJobDto = {
  name?: string;
  description?: string;
  position_id?: number;
  sop_id?: number;
  index?: number;
  url?: string;
};

export type ReorderSpkJobDto = {
  new_index: number;
  spk_id: number;
};
