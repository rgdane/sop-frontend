export type Spk = {
  id: number;
  name: string;
  description: string;
  code: string;
  has_titles?: Title[];
  deleted_at?: string | null;
};

type Title = {
  id: number;
  name: string;
};
