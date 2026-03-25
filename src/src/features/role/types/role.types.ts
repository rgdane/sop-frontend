export type CreateRoleDto = {
  name: string;
  user_has_roles: number[];
};

export type UpdateRoleDto = {
  name?: string;
  user_has_roles?: number[];
  user_has_permissions?: number[];
  role_has_permissions?: number[];
};
