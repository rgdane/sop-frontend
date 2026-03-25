import { createCrudService } from "@/config/crudFactory";
import { CreatePositionDto, UpdatePositionDto } from "../types/position.types";
import { Position } from "@/types/data/position.types";
import axiosInstance from '@/config/axios';

export const positionService = {
  ...createCrudService({
    basePath: "/positions",
    entity: {} as Position,
    postDto: {} as CreatePositionDto,
    updateDto: {} as UpdatePositionDto,
  }),

  bulkCreate: (data: Omit<Position, "id">[]) =>
      axiosInstance.post("/positions/bulk-create", { data }),
  
  bulkUpdate: (ids: number[], data: Partial<Position>) =>
    axiosInstance.put("/positions/bulk-update", { ids, data }),

  bulkDelete: (ids: number[]) =>
    axiosInstance.delete("/positions/bulk-delete", { data: { ids } }),
}
