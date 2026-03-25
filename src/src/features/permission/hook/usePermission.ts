"use client";
import { Permission } from "@/types/data/permission.types";
import { permissionService } from "../services/permissionService";
import { useToast } from "@/components/providers/ToastProvider";

export const usePermissionActions = () => {
  const [toast] = useToast();

  const fetchPermissions = async (
    params: Record<string, any> = {}
  ): Promise<Permission[]> => {
    const res = await permissionService.local.getAll(params);
    return res.data.data;
  };

  const deletePermission = async (id: number) => {
    try {
      await permissionService.local.remove(id);
      toast.success({ message: "Berhasil menghapus Permission" });
    } catch (err: any) {
      toast.error({
        message: "Gagal menghapus Permission",
        description: err.response.data.error,
      });
    }
  };

  const createPermission = async (payload: any) => {
    try {
      await permissionService.local.post(payload);
      toast.success({ message: "Berhasil membuat Permission" });
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat Permission",
        description: err.response.data.error,
      });
    }
  };

  const updatePermission = async (id: number, payload: any) => {
    try {
      await permissionService.local.update(id, payload);
      toast.success({ message: "Berhasil mengubah Permission" });
    } catch (error: any) {
      toast.error({
        message: "gagal mengubah Permission",
        description: error.response.data.error,
      });
    }
  };

  return {
    fetchPermissions,
    createPermission,
    deletePermission,
    updatePermission,
  };
};
