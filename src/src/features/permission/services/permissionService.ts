import { createCrudService } from "@/config/crudFactory";
import { Permission } from "@/types/data/permission.types";
import { CreatePermissionDto, UpdatePermissionDto } from "../types/permission.types";

export const permissionService = createCrudService({
  basePath: "/permissions",
  entity: {} as Permission,
  postDto: {} as CreatePermissionDto,
  updateDto: {} as UpdatePermissionDto,
});
