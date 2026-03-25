import axiosInstance from "@/config/axios";

export const fileServices = {
  get: (name: string) => axiosInstance.get(`/files/${name}`),
  post: (files: File[], onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    return axiosInstance.post("/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          if (onProgress) onProgress(percent);
        }
      },
    });
  },
};
