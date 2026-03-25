import { createCrudService } from "@/config/crudFactory";
import { Sop } from "@/types/data/sop.types";
import { CreateSopDto, ResponseSopDto, UpdateSopDto } from "../types/sop.types";
import axiosInstance from "@/config/axios";

export const sopService = {
  ...createCrudService({
    basePath: "sops",
    entity: {} as any,
    postDto: {} as CreateSopDto,
    updateDto: {} as UpdateSopDto,
  }),

  countSops: (params: Partial<Sop>) =>
    axiosInstance.get("/sops/count", { params: params }),
  bulkCreate: (payload: { data: Omit<Sop, "id">[] }) =>
    axiosInstance.post("/sops/bulk-create", payload),
  bulkUpdate: (ids: number[], data: Partial<Sop>) =>
    axiosInstance.put("/sops/bulk-update", { ids, data }),
  bulkDelete: (ids: number[], isPermanent?: boolean) =>
    axiosInstance.delete("/sops/bulk-delete", {
      data: { ids },
      params: { isPermanent }
    }),
};
