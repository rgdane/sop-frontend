"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { departmentService } from "@/features/department/services/departmentService";
import { Department } from "../../../types/data/department.types";

export const useDepartmentActions = () => {
  const [toast] = useToast();

  const fetchDepartments = async (
    params: Record<string, any> = {}
  ): Promise<Department[]> => {
    const res = await departmentService.local.getAll(params);
    return res.data.data;
  };

  const deleteDepartment = async (id: number) => {
    try {
      await departmentService.local.remove(id);
      toast.success({ message: "Berhasil menghapus department" });
    } catch (err: any) {
      toast.error({
        message: "Gagal menghapus department",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const createDepartment = async (payload: any) => {
    try {
      await departmentService.local.post(payload);
      toast.success({ message: `Berhasil membuat ${payload.name}` });
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat department",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const updateDepartment = async (id: number, payload: any) => {
    try {
      await departmentService.local.update(id, payload);
      toast.success({ message: `Berhasil mengubah ${payload.name}` });
    } catch (err: any) {
      toast.error({
        message: "Gagal mengubah department",
        description: err.response.data.error,
      });
      throw err;
    }
  };

  const bulkCreateDepartments = async (data: Omit<Department, "id">[]) => {
    try {
      await departmentService.bulkCreate(data);
      data.map((item) => {
        toast.success({
          message: `Berhasil membuat ${item.name}`,
        });
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk create",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkUpdateDepartments = async (
    ids: number[],
    data: Partial<Department>
  ) => {
    try {
      await departmentService.bulkUpdate(ids, data);
      toast.success({
        message: `Berhasil mengupdate ${ids.length} department`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const bulkDeleteDepartments = async (ids: number[]) => {
    try {
      await departmentService.bulkDelete(ids);
      toast.success({
        message: `Berhasil menghapus ${ids.length} department`,
      });
    } catch (err: any) {
      toast.error({
        message: "Gagal melakukan bulk delete",
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  return {
    fetchDepartments,
    createDepartment,
    deleteDepartment,
    updateDepartment,
    bulkCreateDepartments,
    bulkUpdateDepartments,
    bulkDeleteDepartments,
  };
};
