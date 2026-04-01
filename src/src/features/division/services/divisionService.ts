import { createCrudService } from "@/config/crudFactory";
import { CreateDivisionDto, UpdateDivisionDto } from "../types/division.types";
import { Division } from "@/types/data/division.types";
import axiosInstance from "@/config/axios";

export const divisionService = {
  ...createCrudService({
    basePath: "/divisions",
    entity: {} as Division,
    postDto: {} as CreateDivisionDto,
    updateDto: {} as UpdateDivisionDto,
  }),

  bulkCreate: (data: Omit<Division, "id">[]) =>
    axiosInstance.post("/divisions/bulk-create", { data }),

  bulkUpdate: (ids: number[], data: Partial<Division>) =>
    axiosInstance.put("/divisions/bulk-update", { ids, data }),

  bulkDelete: (ids: number[]) =>
    axiosInstance.delete("/divisions/bulk-delete", { data: { ids } }),
};
