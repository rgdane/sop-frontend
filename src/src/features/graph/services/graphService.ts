import axiosInstance from "@/config/axios";
import { GraphNode } from "@/types/data/graph.types";

export const graphService = {
  getDocument: (id: number, params: Record<string, any> = {}) => {
    return axiosInstance.get(`/graphs/document/${id}`, { params });
  },
  getGraphById: (elementId: string, params: Record<string, any> = {}) => {
    return axiosInstance.get(`/graphs/${elementId}`, { params });
  },
  getGraphByLabel: (label: string, params: Record<string, any> = {}) => {
    return axiosInstance.get(`/graphs/label/${label}`, { params })
  },
  createText: (id: string, data: Record<string, any>) => {
    return axiosInstance.post(`/graphs/text/${id}`, data);
  },

  createGraph: (data: any) => {
    return axiosInstance.post(`/graphs`, data)
  },

  createTable: (
    id: string,
    data: Record<string, any>,
    params: Record<string, any> = {}
  ) => {
    return axiosInstance.post(`/graphs/table/${id}`, data, { params });
  },

  updateTable: (
    id: string,
    data: Record<string, any>,
    params: Record<string, any> = {}
  ) => {
    return axiosInstance.put(`/graphs/table/${id}`, data, { params });
  },

  updateGraph: (elementId: string, data: Record<string, any>) => {
    return axiosInstance.put(`/graphs/${elementId}`, data);
  },

  mergeGraph: (data: GraphNode) => {
    return axiosInstance.put(`/graphs/merge`, data);
  },

  updateMultipleGraph: (payload: any) => {
    return axiosInstance.put(`/graphs`, payload);
  },

  deleteGraph: (elementIds: string[], params: Record<string, any> = {}) => {
    return axiosInstance.delete(`/graphs/`, {
      data: { elementIds },
      params,
    });
  },
};
