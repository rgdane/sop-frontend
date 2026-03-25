import { User } from "@/types/data/user.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NestedPermissions = Record<string, Record<string, boolean>>;

interface AuthState {
  squad: any;
  isAuthenticated: boolean;
  token: string | null;
  authReady: boolean;
  user: User | null;
  permissions: NestedPermissions;
  title: {
    id: number;
    name: string;
    department_id: number;
    position_id: number;
    level_id: number;
  } | null;
  projects:
  | {
    id: number;
    code: string;
    name: string;
    created_at: string;
    updated_at: string;
  }[]
  | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  projects: null,
  permissions: {},
  title: null,
  squad: null,
  authReady: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPermissions: (state, action: PayloadAction<NestedPermissions>) => {
      state.permissions = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthState["user"] }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    setTitle: (state, action: PayloadAction<AuthState["title"]>) => {
      state.title = action.payload;
    },
    setProjects: (state, action: PayloadAction<AuthState["projects"]>) => {
      state.projects = action.payload;
    },
    setAuthReady: (state, action: PayloadAction<boolean>) => {
      state.authReady = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.permissions = {};
      state.title = null;
    },
  },
});

export const { setCredentials, setAuthReady, setPermissions, setTitle, setProjects, logout } =
  authSlice.actions;
export default authSlice.reducer;
