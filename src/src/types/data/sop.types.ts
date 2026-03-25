export type Sop = {
  id: number;
  name: string;
  description: string;
  code: string;
  division_id: number;
  has_titles: Titles[];
  createdAt: Date;
  updatedAt: Date;
  deleted_at: Date | null;
};

type Titles = {
  id: number;
  name: string;
};
