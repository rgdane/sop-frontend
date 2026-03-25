"use client";
import { useToast } from "@/components/providers/ToastProvider";
import { graphService } from "../services/graphService";
import { CreateGraph, TableData } from "../types/graph.types";
import NodeData, { GraphNode } from "@/types/data/graph.types";

export const useGraphActions = () => {
  const [toast] = useToast();

  const fetchDocumentById = async (
    id: number,
    params: Record<string, any> = {}
  ): Promise<any> => {
    const res = await graphService.getDocument(id, params);
    return res.data.data;
  };

  const createGraph = async (data: GraphNode, useToast: boolean = true): Promise<void> => {
    try {
      await graphService.createGraph(data)
      useToast && toast.success({ message: "Berhasil membuat data" })
    } catch (err: any) {
      console.error(err)
      useToast && toast.error({
        message: "Gagal membuat data",
        description: err.response.data.message
      })
    }
  }

  const mergeGraph = async (data: GraphNode, useToast: boolean = true): Promise<void> => {
    try {
      await graphService.mergeGraph(data)
      useToast && toast.success({ message: "Berhasil membuat data" })
    } catch (err: any) {
      console.error(err)
      useToast && toast.error({
        message: "Gagal membuat data",
        description: err.response.data.message
      })
    }
  }

  const createMultipleGraph = async (datas: GraphNode[], showToast = true) => {
    const results = await Promise.all(
      datas.map(async (item) => {
        try {
          await createGraph(item, false);
          return {
            status: 'success' as const,
            elementId: item.elementId,
          };
        } catch (error: any) {
          return {
            status: 'error' as const,
            elementId: item.elementId,
            error: error.message,
          };
        }
      })
    );

    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'error');

    if (showToast) {
      if (failed.length === 0) {
        toast.success({
          message: `Berhasil membuat data`
        });
      } else {
        toast.error({
          message: `Sebagian gagal`,
          description: `${successful.length} sukses, ${failed.length} gagal`
        });
      }
    }

    return { successful, failed, total: results.length };
  };
  const createTableGraph = async (
    id: string,
    data: Record<string, any>,
    params: Record<string, any> = {}
  ): Promise<void> => {
    try {
      await graphService.createTable(id, data, params);
      toast.success({ message: "Berhasil membuat data" });
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat data",
        description: err.response.data.message,
      });
      throw err;
    }
  };

  const createTextGraph = async (
    id: string,
    data: Record<string, any>
  ): Promise<void> => {
    try {
      await graphService.createText(id, data);
      toast.success({ message: "Berhasil membuat data" });
    } catch (err: any) {
      toast.error({
        message: "Gagal membuat data",
        description: err.response.data.message,
      });
      throw err;
    }
  };

  const updateTableGraph = async (
    id: string,
    data: TableData,
    params: Record<string, any> = {}
  ): Promise<void> => {
    try {
      await graphService.updateTable(id, data, params);
      toast.success({ message: "Berhasil memperbarui data" });
    } catch (err: any) {
      toast.error({
        message: "Gagal memperbarui data",
        description: err.response.data.message,
      });
      console.error(err);
      throw err;
    }
  };

  const updateGraph = async (id: string, data: NodeData) => {
    try {
      await graphService.updateGraph(id, data);
      toast.success({ message: "Berhasil memperbarui data" });
    } catch (error) {
      toast.error({ message: "Gagal memperbarui data" });
    }
  };

  const updateMultipleGraph = async (payload: NodeData[]) => {
    try {
      await graphService.updateMultipleGraph(payload)
      toast.success({ message: "Berhasil memperbarui data" })
    } catch (error) {
      console.error(error)
      toast.error({ message: "Gagal memperbarui data" })
    }
  }

  const deleteGraph = async (
    elementIds: string[],
    params: Record<string, any> = {}
  ): Promise<boolean> => {
    try {
      await graphService.deleteGraph(elementIds, params);
      toast.success({ message: `Berhasil menghapus data` });
      return true;
    } catch (err: any) {
      console.error(err)
      toast.error({
        message: "Gagal menghapus data",
        description: err.response?.data?.message || err.message,
      });
      return false;
    }
  };

  const fetchGraphByLabel = async (label: string, params?: any) => {
    try {
      const res = await graphService.getGraphByLabel(label, params)
      if (res.data.data) return res.data.data
      return null
    } catch (error: any) {
      console.error(error)
      toast.error({
        message: "Gagal mengambil data",
        description: error.response?.data?.message || error.message
      })
      return null
    }
  }

  const fetchGraphById = async (id: string, params?: any) => {
    try {
      const res = await graphService.getGraphById(id, params);
      return res.data.data;
    } catch (err: any) {
      toast.error({
        message: "Gagal mengambil data",
        description: err.response?.data?.message || err.message,
      });
      return null;
    }
  }

  return {
    fetchGraphById,
    fetchGraphByLabel,
    fetchDocumentById,
    createGraph,
    createMultipleGraph,
    createTableGraph,
    createTextGraph,
    updateTableGraph,
    updateGraph,
    updateMultipleGraph,
    deleteGraph,
    mergeGraph
  };
};
