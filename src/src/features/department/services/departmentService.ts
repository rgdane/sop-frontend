import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "../types/department.types";
import { Department } from "../../../types/data/department.types";
import { createCrudService } from "@/config/crudFactory";
import axiosInstance from "@/config/axios";

export const departmentService = {
  ...createCrudService({
    basePath: "/departments",
    entity: {} as Department,
    postDto: {} as CreateDepartmentDto,
    updateDto: {} as UpdateDepartmentDto,
  }),

  bulkCreate: (data: Omit<Department, "id">[]) =>
    axiosInstance.post("/departments/bulk-create", { data }),

  bulkUpdate: (ids: number[], data: Partial<Department>) =>
    axiosInstance.put("/departments/bulk-update", { ids, data }),

  bulkDelete: (ids: number[]) =>
    axiosInstance.delete("/departments/bulk-delete", { data: { ids } }),
};
