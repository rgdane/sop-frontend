import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "@/features/themes/themeSlice";
import authReducer from "@/features/auth/authSlice";
import roleReducer from "@/features/role/roleSlice";
import userReducer from "@/features/user/userSlice";
import layoutReducer from "@/slice/layoutSlice";
import editorReducer from "@/slice/editorSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    users: userReducer,
    roles: roleReducer,
    layout: layoutReducer,
    editor: editorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
