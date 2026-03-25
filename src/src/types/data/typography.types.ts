export type Typography = {
  id: number;
  category?: string;
  name: string;
  size_px: number;
  size_rem: number;
  weight: number;
  line_height: number;
  letter_spacing: number;
  font_family: string;
  project_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};