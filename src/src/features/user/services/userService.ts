import { User } from "@/types/data/user.types";
import axiosInstance from "@/config/axios";

const _PATH = '/users'

export const fetchUsers = async (params: Record<string, any> = {}) => {
  const res = await axiosInstance.get<{ data: User[]; total?: number }>(`${_PATH}`, { params });
  return res.data;
};

export const fetchUserById = async (id: number, params: Record<string, any> = {}) => {
  const res = await axiosInstance.get<{ data: User }>(`${_PATH}/${id}`, params);
  return res.data.data;
};

export const createUser = async (payload: any) => {
  const data = await axiosInstance.post<{ data: User }>(`${_PATH}`, payload);
  return data;
};

export const updateUser = async (id: number, payload: any) => {
  await axiosInstance.put(`${_PATH}/${id}`, payload);
};

export const deleteUser = async (id: number, isPermanent?: boolean) => {
  await axiosInstance.delete(`${_PATH}/${id}`, { params: { isPermanent } });
};

export const bulkCreateUsers = async (data: Omit<User, "id">[]) => {
  await axiosInstance.post(`${_PATH}/bulk-create`, { users: data });
};

export const bulkUpdateUsers = async (ids: number[], data: Partial<User>) => {
  await axiosInstance.put(`${_PATH}/bulk-update`, { ids, data });
};

export const bulkDeleteUsers = async (ids: number[], isPermanent?: boolean) => {
  await axiosInstance.delete(`${_PATH}/bulk-delete`, { data: { ids }, params: { isPermanent } });
};
