"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { levelService } from "@/features/level/services/levelService";
import { Level } from "@/types/data/level.types";

export const useLevelActions = () => {
  const [toast] = useToast();

  const fetchLevels = async (
    params: Record<string, any> = {}
  ): Promise<Level[]> => {
    const res = await levelService.local.getAll(params);
    return res.data.data;
  };

  const deleteLevel = async (id: number) => {
    try {
      await levelService.local.remove(id);
      toast.success({ message: "Berhasil menghapus level" });
    } catch (err: any) {
      toast.error({
        message: "Gagal menghapus data level",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const createLevel = async (payload: any) => {
    try {
      await levelService.local.post(payload);
      toast.success({ message: `Berhasil membuat ${payload.name}` });
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat data level",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const updateLevel = async (id: number, payload: any) => {
    try {
      await levelService.local.update(id, payload);
      toast.success({ message: `Berhasil mengubah ${payload.name}` });
    } catch (err: any) {
      toast.error({
        message: "Gagal mengubah data level",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const bulkCreateLevels = async (data: Omit<Level, "id">[]) => {
    try {
      await levelService.bulkCreate(data);
      data.map((item) => {
        toast.success({
          message: `Berhasil membuat ${item.name}`,
        });
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk create",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkUpdateLevels = async (ids: number[], data: Partial<Level>) => {
    try {
      await levelService.bulkUpdate(ids, data);
      toast.success({
        message: `Berhasil mengupdate ${ids.length} level`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkDeleteLevels = async (ids: number[]) => {
    try {
      await levelService.bulkDelete(ids);
      toast.success({
        message: `Berhasil menghapus ${ids.length} level`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk delete",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  return {
    fetchLevels,
    createLevel,
    deleteLevel,
    updateLevel,
    bulkCreateLevels,
    bulkUpdateLevels,
    bulkDeleteLevels,
  };
};
