import { User } from "@/types/data/user.types";

export type CreateUserDto = {
  code?: string;
  name: string;
  email: string;
  password: string;
  title_id: number;
};

export type UpdateUserDto = {
  code?: string;
  name?: string;
  email?: string;
  password?: string;
  title_id?: number;
  has_roles?: any;
};

export type ResponseUserDto = {
  data?: User[];
  total?: number;
  cursor?: number;
};
