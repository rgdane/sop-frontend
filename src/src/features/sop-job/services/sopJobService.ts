import { createCrudService } from "@/config/crudFactory";
import {
  CreateSopJobDto,
  ReorderSopJobDto,
  UpdateSopJobDto,
} from "../types/sop_job.types";
import axiosInstance from "@/config/axios";
import { SopJob } from "@/types/data/sop_job.types";
export const sopJobService = {
  ...createCrudService({
    basePath: "/sop-jobs",
    entity: {} as SopJob,
    postDto: {} as CreateSopJobDto,
    updateDto: {} as UpdateSopJobDto,
  }),

  bulkUpdate: (ids: number[], data: Partial<SopJob>) =>
    axiosInstance.put("/sop-jobs/bulk-update", { ids, data }),

  bulkCreate: (data: Omit<SopJob, "id">[]) =>
    axiosInstance.post("/sop-jobs/bulk-create", { data }),

  bulkDelete: (ids: number[]) =>
    axiosInstance.delete("/sop-jobs/bulk-delete", { data: { ids } }),

  reorder: (sopJobId: number, data: ReorderSopJobDto) =>
    axiosInstance.put(`/sop-jobs/${sopJobId}/reorder`, data),
};
