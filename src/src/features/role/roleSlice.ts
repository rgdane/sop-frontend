import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Role } from "@/types/data/role.types";

interface RoleState {
  data: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  data: [],
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<Role | Role[]>) => {
      if (Array.isArray(action.payload)) {
        state.data = action.payload;
      } else {
        state.data = [action.payload, ...state.data];
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearRoles: (state) => {
      state.data = [];
    },
  },
});

export const { setData, setLoading, setError, clearRoles } = roleSlice.actions;
export default roleSlice.reducer;
