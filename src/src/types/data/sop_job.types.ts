export type SopJob = {
  id: number;
  name: string;
  alias: string;
  type: string;
  position_id: number;
  sop_id: number;
  reference_id: number;
  index: number;
  description: string;
  step: string;
  output: string;
  has_positions?: Position[];
  has_sop?: any[];
  is_published?: boolean;
};

type Position = {
  id: number;
  name: string;
};
