import { Position } from "./position.types";

export type SpkJob = {
  id: number;
  name: string;
  description: string;
  spk_id: number;
  position_id: number;
  code: string;
  index: number;
  sop_id?: number;
  has_positions?: Position[];
  has_sop?: any[];
};
