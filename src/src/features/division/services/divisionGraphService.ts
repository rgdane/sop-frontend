import { CreateDivisionDto, UpdateDivisionDto } from "../types/division.types";
import { Division } from "@/types/data/division.types";
import axiosInstance from '@/config/axios';

const _PATH = "/divisions/graph";

export const fetchDivisions = async (
  params: Record<string, any> = {}
): Promise<Division[]> => {
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

export const fetchDivisionById = async (id: number, params: Record<string, any> = {}): Promise<Division> => {
  const res = await axiosInstance.get(`${_PATH}/${id}`, { params });
  return res.data.data;
};

export const createDivision = async (payload: CreateDivisionDto) => {
  await axiosInstance.post(_PATH, payload);
};

export const updateDivision = async (id: number, payload: UpdateDivisionDto) => {
  await axiosInstance.put(`${_PATH}/${id}`, payload);
};

export const deleteDivision = async (id: number) => {
  await axiosInstance.delete(`${_PATH}/${id}`);
};

export const bulkCreateDivisions = async (data: Omit<Division, "id">[]) => {
  await axiosInstance.post(`${_PATH}/bulk-create`, { data });
};

export const bulkUpdateDivisions = async (ids: number[], data: Partial<Division>) => {
  await axiosInstance.put(`${_PATH}/bulk-update`, { ids, data });
};

export const bulkDeleteDivisions = async (ids: number[]) => {
  await axiosInstance.delete(`${_PATH}/bulk-delete`, {
    data: { ids },
  });
};

