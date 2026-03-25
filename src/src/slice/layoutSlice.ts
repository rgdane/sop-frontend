import { createSlice } from "@reduxjs/toolkit";

interface LayoutState {
  collapsed: boolean;
}

const initialState: LayoutState = {
  collapsed: typeof window !== "undefined"
    ? localStorage.getItem("sidebar-collapsed") === "true"
    : false,
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleCollapsed(state) {
      state.collapsed = !state.collapsed;
      localStorage.setItem("sidebar-collapsed", String(state.collapsed));
    },
    setCollapse(state, action) {
      state.collapsed = action.payload;
      localStorage.setItem("sidebar-collapsed", String(state.collapsed));
    },
  },
});

export const { toggleCollapsed, setCollapse } = layoutSlice.actions;
export default layoutSlice.reducer;
