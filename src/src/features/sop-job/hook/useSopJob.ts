"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { sopJobService } from "../services/sopJobService";
import { SopJob } from "@/types/data/sop_job.types";

export const useSopJobActions = () => {
  const [toast] = useToast();

  const fetchSopJobs = async (
    params: Record<string, any> = {}
  ): Promise<SopJob[]> => {
    const res = await sopJobService.local.getAll(params);
    return res.data.data;
  };

  const fetchSopJobById = async (
    id: number,
    params: Record<string, any> = {}
  ): Promise<SopJob> => {
    const res = await sopJobService.local.getById(id, params);
    const sopJob = res.data.data;
    return sopJob;
  };

  const deleteSopJob = async (id: number) => {
    try {
      await sopJobService.local.remove(id);
      toast.success({ message: "Berhasil menghapus pekerjaan sop" });
    } catch (err: any) {
      toast.error({
        message: "Gagal menghapus data pekerjaan sop",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const createSopJob = async (payload: any) => {
    try {
      await sopJobService.local.post(payload);
      toast.success({ message: "Berhasil membuat pekerjaan sop" });
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat data pekerjaan sop",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const updateSopJob = async (id: number, payload: any) => {
    try {
      await sopJobService.local.update(id, payload);
      toast.success({ message: "Berhasil mengubah pekerjaan sop" });
    } catch (err: any) {
      toast.error({
        message: "Gagal mengubah data pekerjaan sop",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const bulkCreateSopJobs = async (data: Omit<SopJob, "id">[]) => {
    try {
      const res = await sopJobService.bulkCreate(data);
      if (res.status === 200) {
        toast.success({
          message: `Berhasil membuat ${data.length} pekerjaan SOP`,
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

  const bulkUpdateSopJobs = async (ids: number[], data: Partial<SopJob>) => {
    try {
      await sopJobService.bulkUpdate(ids, data);
      toast.success({
        message: `Berhasil mengupdate ${ids.length} pekerjaan SOP`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };
  const bulkDeleteSopJobs = async (ids: number[]) => {
    try {
      await sopJobService.bulkDelete(ids);
      toast.success({
        message: `Berhasil menghapus ${ids.length} pekerjaan sop`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk delete",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const reorderSopJob = async (
    sopJobId: number,
    newIndex: number,
    sopId: number
  ) => {
    try {
      if (!sopId) {
        toast.error({
          message: "Gagak mengurutkan job",
          description: "Anda tidak memiliki sop",
        });

        return [];
      }
      await sopJobService.reorder(sopJobId, {
        new_index: newIndex,
        sop_id: sopId,
      });

      toast.success({ message: "Berhasil mengurutkan job" });
    } catch (err: any) {
      if (err.response?.data?.message?.includes("default")) {
        toast.error({ message: "Gagal mengurutkan sop job" });
      }
      throw err;
    }
  };

  return {
    fetchSopJobs,
    fetchSopJobById,
    createSopJob,
    deleteSopJob,
    updateSopJob,
    bulkCreateSopJobs,
    bulkUpdateSopJobs,
    bulkDeleteSopJobs,
    reorderSopJob,
  };
};
