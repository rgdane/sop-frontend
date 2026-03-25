import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/data/user.types";

interface UserState {
  data: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  data: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<User | User[]>) => {
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

export const { setData, setLoading, setError, clearRoles } = userSlice.actions;
export default userSlice.reducer;
