import { createCrudService } from "@/config/crudFactory";
import axiosInstance from "@/config/axios";
import { SpkJob } from "@/types/data/spk_job.types";
import {
  CreateSpkJobDto,
  ReorderSpkJobDto,
  UpdateSpkJobDto,
} from "../types/spk_job.types";
export const spkJobService = {
  ...createCrudService({
    basePath: "/spk-jobs",
    entity: {} as SpkJob,
    postDto: {} as CreateSpkJobDto,
    updateDto: {} as UpdateSpkJobDto,
  }),

  bulkCreate: (data: Omit<SpkJob, "id">[]) =>
    axiosInstance.post("/spk-jobs/bulk-create", { data }),

  bulkDelete: (ids: number[]) =>
    axiosInstance.delete("/spk-jobs/bulk-delete", { data: { ids } }),

  reorder: (spkJobId: number, data: ReorderSpkJobDto) =>
    axiosInstance.put(`/spk-jobs/${spkJobId}/reorder`, data),
};
