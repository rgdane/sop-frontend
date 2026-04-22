"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { Spk } from "@/types/data/spk.types";
import { spkService } from "../services/spkService";
import { ResponseSpkDto } from "../types/spk.types";

export const useSpkActions = () => {
  const [toast] = useToast();

  const fetchSpks = async (
    params: Record<string, any> = {}
  ): Promise<ResponseSpkDto> => {
    const res = await spkService.local.getAll(params);
    const { data, total }: any = res.data;

    return { data, total };
  };

  const fetchSpkById = async (
    id: number,
    params: Record<string, any> = {}
  ): Promise<Spk> => {
    const res = await spkService.local.getById(id, params);
    const spk = res.data.data;
    return spk;
  };

  const deleteSpk = async (id: number) => {
    try {
      await spkService.local.remove(id);
      toast.success({ message: "Berhasil menghapus spk" });
    } catch (err: any) {
      toast.error({
        message: "Gagal menghapus data spk",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const createSpk = async (payload: any): Promise<Spk> => {
    try {
      const res = await spkService.local.post(payload);
      toast.success({ message: "Berhasil membuat spk" });
      return res.data.data;
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat data spk",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const updateSpk = async (id: number, payload: any) => {
    try {
      await spkService.local.update(id, payload);
      toast.success({ message: "Berhasil mengubah spk" });
    } catch (err: any) {
      toast.error({
        message: "Gagal mengubah data spk",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const bulkCreateSpks = async (payload: { data: Omit<Spk, "id">[] }) => {
    try {
      await spkService.bulkCreate(payload);
      toast.success({
        message: `Berhasil membuat ${payload.data.length} data spk`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk create",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkUpdateSpks = async (ids: number[], data: Partial<Spk>) => {
    try {
      await spkService.bulkUpdate(ids, data);
      toast.success({
        message: `Berhasil mengupdate ${ids.length} spk`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkDeleteSpks = async (ids: number[]) => {
    try {
      await spkService.bulkDelete(ids);
      toast.success({
        message: `Berhasil menghapus ${ids.length} spk`,
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
    fetchSpks,
    fetchSpkById,
    createSpk,
    deleteSpk,
    updateSpk,
    bulkCreateSpks,
    bulkUpdateSpks,
    bulkDeleteSpks,
  };
};
