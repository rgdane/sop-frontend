import axiosInstance from "@/config/axios";

// --- Ambil komentar ---
export const getComments = async (elementId: string): Promise<any> => {
  if (typeof window === "undefined") return [];
  const { data } = await axiosInstance.get(`/graphs/comment/${elementId}`);
  return data.data || [];
};

// --- Simpan komentar parent ---
export const saveParentComment = async (data: any, elementId: string) => {
  if (typeof window === "undefined") return;
  return await axiosInstance.post(`/graphs/comment/${elementId}`, data);
};

export const addReview = async (payload: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/graphs/review/${payload.commentId}`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to add review:", error);
    throw error;
  }
}
