export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type AuthDto = {
  email: string;
  password: string;
};

export type Permissions = {
  name: string;
};

export type AuthResponse = {
  id: number;
  name: string;
  email: string;
  token: string;
};

export type ProfileResponse = {
  data: {
    id: number;
    name: string;
    email: string;
    has_roles?: any[];
    has_squads?: any[];
    title?: any;
    is_password_default?: boolean;
    workspace?: string;
  };
  success: boolean;
};
