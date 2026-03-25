"use client";
import { Role } from "@/types/data/role.types";
import axiosInstance from "@/config/axios";

const _PATH = "/roles";

export const fetchRoles = async (
    params: Record<string, any> = {}
): Promise<Role[]> => {
    const response = await axiosInstance.get(_PATH, { params });

    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }

    console.error('Unexpected API response format:', response.data);
    return [];
};

export const fetchRoleById = async (id: number): Promise<Role> => {
    const response = await axiosInstance.get(`${_PATH}/${id}`);
    return response.data.data;
}

export const deleteRole = async (id: number) => {
    await axiosInstance.delete(`${_PATH}/${id}`);
};

export const createRole = async (payload: any) => {
    await axiosInstance.post(_PATH, payload);
};

export const updateRole = async (id: number, payload: any) => {
    const res = await axiosInstance.put(`${_PATH}/${id}`, payload);
    return res;
};

export const bulkCreateRoles = async (data: Omit<Role, "id">[]) => {
    await axiosInstance.post("/roles/bulk-create", { roles: data });
};

export const bulkUpdateRoles = async (ids: number[], data: Partial<Role>) => {
    await axiosInstance.put("/roles/bulk-update", { ids, data });
};

export const bulkDeleteRoles = async (ids: number[], isPermanent?: boolean) => {
    await axiosInstance.delete("/roles/bulk-delete", {
        data: { ids },
        params: { isPermanent },
    });
};