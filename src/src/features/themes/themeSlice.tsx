import { createSlice } from "@reduxjs/toolkit";

interface ThemeState {
  isDark: boolean;
}

const initialState: ThemeState = {
  isDark:
    typeof window !== "undefined"
      ? localStorage.getItem("theme") === "dark" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.isDark = !state.isDark;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.isDark ? "dark" : "light");
        document.documentElement.classList.toggle("dark", state.isDark);
      }
    },
    initializeTheme(state, action: { payload: boolean }) {
      state.isDark = action.payload;
    },
  },
});

export const { toggleTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
