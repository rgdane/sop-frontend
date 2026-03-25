export type CreateDepartmentDto = {
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
};

export type UpdateDepartmentDto = {
  name?: string;
  code?: string;
  created_at?: string;
  updated_at?: string;
};
