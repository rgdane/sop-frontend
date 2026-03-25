import { createCrudService } from "@/config/crudFactory";
import { CreateLevelDto, UpdateLevelDto } from "../types/level.types";
import { Level } from "@/types/data/level.types";
import axiosInstance from "@/config/axios";

export const levelService = {
  ...createCrudService({
    basePath: "/levels",
    entity: {} as Level,
    postDto: {} as CreateLevelDto,
    updateDto: {} as UpdateLevelDto,
  }),

  bulkCreate: (data: Omit<Level, "id">[]) =>
    axiosInstance.post("/levels/bulk-create", { data }),

  bulkUpdate: (ids: number[], data: Partial<Level>) =>
    axiosInstance.put("/levels/bulk-update", { ids, data }),

  bulkDelete: (ids: number[]) =>
    axiosInstance.delete("/levels/bulk-delete", { data: { ids } }),
};
