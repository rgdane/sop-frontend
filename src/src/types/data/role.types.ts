export type Role = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  start_date?: string;
  end_date?: string;
  has_user?: RoleHasUser[];
  user_has_roles?: RoleHasUser[];
};

export type CreateRoleDto = {
  name: string;
  start_date?: string;
  end_date?: string;
};

export type UpdateRoleDto = Partial<CreateRoleDto>;

export type RoleHasUser = {
  id: number;
  name: string;
};
