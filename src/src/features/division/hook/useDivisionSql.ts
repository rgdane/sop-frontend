"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { divisionService } from "@/features/division/services/divisionSqlService";
import { Division } from "@/types/data/division.types";

export const useDivisionActions = () => {
  const [toast] = useToast();

  const fetchDivisions = async (
    params: Record<string, any> = {}
  ): Promise<Division[]> => {
    const res = await divisionService.local.getAll(params);
    return res.data.data;
  };

  const deleteDivision = async (id: number) => {
    try {
      await divisionService.local.remove(id);
      toast.success({ message: "Berhasil menghapus division" });
    } catch (err: any) {
      toast.error({
        message: "Gagal menghapus data division",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const createDivision = async (payload: any) => {
    try {
      await divisionService.local.post(payload);
      toast.success({ message: `Berhasil membuat ${payload.name}` });
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat data division",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const updateDivision = async (id: number, payload: any) => {
    try {
      await divisionService.local.update(id, payload);
      toast.success({ message: `Berhasil mengubah ${payload.name}` });
    } catch (err: any) {
      toast.error({
        message: "Gagal mengubah data division",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const bulkCreateDivisions = async (data: Omit<Division, "id">[]) => {
    try {
      await divisionService.bulkCreate(data);
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

  const bulkUpdateDivisions = async (ids: number[], data: Partial<Division>) => {
    try {
      await divisionService.bulkUpdate(ids, data);
      toast.success({
        message: `Berhasil mengupdate ${ids.length} division`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkDeleteDivisions = async (ids: number[]) => {
    try {
      await divisionService.bulkDelete(ids);
      toast.success({
        message: `Berhasil menghapus ${ids.length} division`,
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
    fetchDivisions,
    createDivision,
    deleteDivision,
    updateDivision,
    bulkCreateDivisions,
    bulkUpdateDivisions,
    bulkDeleteDivisions,
  };
};
