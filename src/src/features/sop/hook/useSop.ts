"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { sopService } from "@/features/sop/services/sopService";
import { Sop } from "@/types/data/sop.types";
import { CreateSopDto, ResponseSopDto, UpdateSopDto } from "../types/sop.types";
import { useAuthAction } from "@/features/auth/hook/useAuth";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";

export const useSopActions = () => {
  const [toast] = useToast();
  const { getCurrentTitle } = useAuthAction();
  const { hasViewOwnOnly } = useFilterRBAC();
  const currentTitle = getCurrentTitle();

  const fetchSops = async (
    params: Record<string, any> = {}
  ): Promise<ResponseSopDto> => {
    if (hasViewOwnOnly() && currentTitle?.id) {
      params.title_id = currentTitle.id;
    }
    const res = await sopService.local.getAll(params);
    const { data, total }: any = res.data;
    return {
      data,
      total,
    };
  };

  const countSops = async (
    params: Record<string, any> = {}
  ): Promise<number> => {
    const res = await sopService.countSops(params);
    return res.data.data;
  }

  const createSop = async (payload: any) => {
    try {
      // await sopService.local.post(payload);
      const res = await sopService.local.post(payload);
      toast.success({ message: `Berhasil membuat SOP "${payload.name}"` });
      return res.data.data;
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat data SOP",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const updateSop = async (id: number, payload: any) => {
    try {
      await sopService.local.update(id, payload);
      toast.success({ message: `Berhasil mengubah SOP "${payload.name}"` });
    } catch (err: any) {
      toast.error({
        message: "Gagal mengubah data SOP",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const deleteSop = async (id: number, isPermanent?: boolean) => {
    try {
      await sopService.local.remove(id, isPermanent);
      toast.success({ message: "Berhasil menghapus SOP" });
    } catch (err: any) {
      toast.error({
        message: "Gagal menghapus data SOP",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const bulkCreateSops = async (payload: { data: Omit<Sop, "id">[] }) => {
    try {
      await sopService.bulkCreate(payload);
      payload.data.map((item) => {
        toast.success({
          message: `Berhasil membuat ${item.name} data sop`,
        })
      })
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk create",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkUpdateSops = async (ids: number[], data: Partial<Sop>) => {
    try {
      await sopService.bulkUpdate(ids, data);
      toast.success({
        message: `Berhasil mengupdate ${ids.length} SOP`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkDeleteSops = async (ids: number[], isPermanent?: boolean) => {
    try {
      await sopService.bulkDelete(ids, isPermanent);
      toast.success({
        message: `Berhasil menghapus ${ids.length} SOP`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk delete",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const fetchSopById = async (
    id: number,
    options: { preload?: boolean } = {}
  ): Promise<Sop> => {
    const res = await sopService.local.getById(id, {
      preload: options.preload ?? true,
    });
    return res.data.data;
  };

  return {
    fetchSopById,
    countSops,
    fetchSops,
    createSop,
    deleteSop,
    updateSop,
    bulkCreateSops,
    bulkUpdateSops,
    bulkDeleteSops,
  };
};
