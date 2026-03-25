import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EditorState {
  commentModalOpen: boolean;
  selectedCommentId: string | null;
  editorReady: boolean;
}

const initialState: EditorState = {
  commentModalOpen: false,
  selectedCommentId: null,
  editorReady: false,
};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    openCommentModal: (state, action: PayloadAction<string>) => {
      state.commentModalOpen = true;
      state.selectedCommentId = action.payload;
    },
    closeCommentModal: (state) => {
      state.commentModalOpen = false;
      state.selectedCommentId = null;
    },
    setEditorReady: (state, action: PayloadAction<boolean>) => {
      state.editorReady = action.payload;
    },
  },
});

export const {
  openCommentModal,
  closeCommentModal,
  setEditorReady,
} = editorSlice.actions;

export default editorSlice.reducer;
