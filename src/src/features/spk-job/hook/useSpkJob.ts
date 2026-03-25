"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { spkJobService } from "../services/spkJobService";
import { SpkJob } from "@/types/data/spk_job.types";

export const useSpkJobActions = () => {
  const [toast] = useToast();

  const fetchSpkJobs = async (
    params: Record<string, any> = {}
  ): Promise<SpkJob[]> => {
    const res = await spkJobService.local.getAll(params);
    return res.data.data;
  };

  const fetchSpkJobById = async (
    id: number,
    params: Record<string, any> = {}
  ): Promise<SpkJob> => {
    const res = await spkJobService.local.getById(id, params);
    const spkJob = res.data.data;
    return spkJob;
  };

  const deleteSpkJob = async (id: number) => {
    try {
      await spkJobService.local.remove(id);
      toast.success({ message: "Berhasil menghapus pekerjaan spk" });
    } catch (err: any) {
      toast.error({
        message: "Gagal menghapus data pekerjaan spk",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const createSpkJob = async (payload: any) => {
    try {
      await spkJobService.local.post(payload);
      toast.success({ message: "Berhasil membuat pekerjaan spk" });
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat data pekerjaan spk",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const updateSpkJob = async (id: number, payload: any) => {
    try {
      await spkJobService.local.update(id, payload);
      toast.success({ message: "Berhasil mengubah pekerjaan spk" });
    } catch (err: any) {
      toast.error({
        message: "Gagal mengubah data pekerjaan spk",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const bulkCreateSpkJobs = async (data: Omit<SpkJob, "id">[]) => {
    try {
      const res = await spkJobService.bulkCreate(data);
      if (res.status === 200) {
        toast.success({
          message: `Berhasil membuat ${data.length} pekerjaan spk`,
        });
      }
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk create",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkDeleteSpkJobs = async (ids: number[]) => {
    try {
      await spkJobService.bulkDelete(ids);
      toast.success({
        message: `Berhasil menghapus ${ids.length} pekerjaan spk`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk delete",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const reorderSpkJob = async (
    spkJobId: number,
    newIndex: number,
    spkId: number
  ) => {
    try {
      if (!spkId) {
        toast.error({
          message: "Gagak mengurutkan job",
          description: "Anda tidak memiliki spk",
        });

        return [];
      }
      await spkJobService.reorder(spkJobId, {
        new_index: newIndex,
        spk_id: spkId,
      });

      toast.success({ message: "Berhasil mengurutkan job" });
    } catch (err: any) {
      if (err.response?.data?.message?.includes("default")) {
        toast.error({ message: "Gagal mengurutkan spk job" });
      }
      throw err;
    }
  };

  return {
    fetchSpkJobs,
    fetchSpkJobById,
    createSpkJob,
    deleteSpkJob,
    updateSpkJob,
    bulkCreateSpkJobs,
    bulkDeleteSpkJobs,
    reorderSpkJob,
  };
};
