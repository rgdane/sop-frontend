import { useToast } from "@/components/providers/ToastProvider";
import { fileServices } from "../services/fileServices";

export const useFilesActions = () => {
  const [toast] = useToast();

  const fetchFiles = async (name: string) => {
    try {
      const res: any = await fileServices.get(name);
      return res;
    } catch (error) {
      throw error;
    }
  };

  // ⬇️ Tambah `onProgress` di parameter
  const postFiles = async (
    files: File[],
    onProgress?: (percent: number) => void
  ) => {
    try {
      const res: any = await fileServices.post(files, onProgress);
      let payload = {
        ...res.data,
        url: `${process.env.NEXT_PUBLIC_API_URL}/files/${res.data.object_name}`,
      };
      toast.success({ message: "Berhasil upload file" });
      return payload;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error occurred";
      toast.error({ message: "Gagal upload file", description: errorMessage });
      throw error;
    }
  };

  return {
    fetchFiles,
    postFiles,
  };
};
