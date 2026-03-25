import { CreateTitleDto, UpdateTitleDto } from "../types/title.types";
import { Title } from "@/types/data/title.types";
import axiosInstance from '@/config/axios';

const _PATH = "/titles";

export const fetchTitles = async (
  params: Record<string, any> = {}
): Promise<Title[]> => {
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

export const fetchTitleById = async (id: number, params: Record<string, any> = {}): Promise<Title> => {
  const res = await axiosInstance.get(`${_PATH}/${id}`, { params });
  return res.data.data;
};

export const createTitle = async (payload: CreateTitleDto) => {
  await axiosInstance.post(_PATH, payload);
};

export const updateTitle = async (id: number, payload: UpdateTitleDto) => {
  await axiosInstance.put(`${_PATH}/${id}`, payload);
};

export const deleteTitle = async (id: number) => {
  await axiosInstance.delete(`${_PATH}/${id}`);
};

export const bulkCreateTitles = async (data: Omit<Title, "id">[]) => {
  await axiosInstance.post(`${_PATH}/bulk-create`, { data });
};

export const bulkUpdateTitles = async (ids: number[], data: Partial<Title>) => {
  await axiosInstance.put(`${_PATH}/bulk-update`, { ids, data });
};

export const bulkDeleteTitles = async (ids: number[]) => {
  await axiosInstance.delete(`${_PATH}/bulk-delete`, {
    data: { ids },
  });
};


