import { createCrudService } from "@/config/crudFactory";
import { Spk } from "@/types/data/spk.types";
import { CreateSpkDto, UpdateSpkDto } from "../types/spk.types";
import axiosInstance from "@/config/axios";

export const spkService = {
  ...createCrudService({
    basePath: "/spks",
    entity: {} as Spk,
    postDto: {} as CreateSpkDto,
    updateDto: {} as UpdateSpkDto,
  }),

  bulkCreate: (payload: { data: Omit<Spk, "id">[] }) =>
    axiosInstance.post("/spks/bulk-create", payload),

  bulkUpdate: (ids: number[], data: Partial<Spk>) =>
    axiosInstance.put("/spks/bulk-update", { ids, data }),

  bulkDelete: (ids: number[]) =>
    axiosInstance.delete("/spks/bulk-delete", { data: { ids } }),
};
