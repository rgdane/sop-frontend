"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from "@/components/providers/ToastProvider";
import { bulkCreateTitles, bulkDeleteTitles, bulkUpdateTitles, createTitle, deleteTitle, fetchTitleById, fetchTitles, updateTitle } from '../services/titleService';
import { formatColor } from "@/lib/formatColor";

export const useTitleActions = () => {
  const queryClient = useQueryClient();
  const [toast] = useToast();
  const [titleId, setTitleId] = useState<number | null>(null);
  const [titleParams, setTitleParams] = useState<Record<string, any>>({})

  const fetchTitlesQuery = useQuery({
    queryKey: ['titles', titleParams],
    queryFn: () => fetchTitles(titleParams),
    staleTime: 5 * 60 * 1000,
  });

  const fetchTitleByIdQuery = useQuery({
    queryKey: ['title', titleId],
    queryFn: async () => {
      return await fetchTitleById(titleId!, titleParams);
    },
    enabled: !!titleId,
    staleTime: 5 * 60 * 1000,
  });

  const createTitleMutation = useMutation({
    mutationFn: (payload: any) => {
      const formattedPayload = {
        ...payload,
        color: formatColor(payload.color)
      }
      return createTitle(formattedPayload);
    },
    onSuccess: () => {
      toast.success({ message: "Berhasil membuat data" });
      queryClient.invalidateQueries({ queryKey: ['titles', titleParams] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal membuat data",
        description: err?.response?.data?.error,
      });
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => {
      const formattedPayload = {
        ...payload,
        ...(payload.color && { color: formatColor(payload.color) })
      }
      return updateTitle(id, formattedPayload);
    },
    onSuccess: () => {
      toast.success({ message: "Berhasil mengubah data" });
      queryClient.invalidateQueries({ queryKey: ['titles', titleParams] });
      queryClient.invalidateQueries({ queryKey: ['title'] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal mengubah data",
        description: err?.response?.data?.error,
      });
    },
  });

  const deleteTitleMutation = useMutation({
    mutationFn: deleteTitle,
    onSuccess: () => {
      toast.success({ message: "Berhasil menghapus data" });
      queryClient.invalidateQueries({ queryKey: ['titles', titleParams] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal menghapus data",
        description: err?.response?.data?.error,
      });
    },
  });

  const bulkCreateTitlesMutation = useMutation({
    mutationFn: bulkCreateTitles,
    onSuccess: (data, variables) => {
      toast.success({
        message: `Berhasil membuat ${variables.length} data`,
      });
      queryClient.invalidateQueries({ queryKey: ['titles', titleParams] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal melakukan bulk create",
        description: err.response?.data?.error || err.message,
      });
    },
  });

  const bulkUpdateTitlesMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: number[]; data: any }) => bulkUpdateTitles(ids, data),
    onSuccess: () => {
      toast.success({
        message: `Berhasil mengupdate datas`,
      });
      queryClient.invalidateQueries({ queryKey: ['titles', titleParams] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
    },
  });

  const bulkDeleteTitlesMutation = useMutation({
    mutationFn: ({ ids }: { ids: number[] }) => bulkDeleteTitles(ids),
    onSuccess: () => {
      toast.success({
        message: `Berhasil menghapus datas`,
      });
      queryClient.invalidateQueries({ queryKey: ['titles', titleParams] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal melakukan bulk delete",
        description: err.response?.data?.error || err.message,
      });
    },
  });

  return {
    // data
    title: fetchTitleByIdQuery.data,
    titles: fetchTitlesQuery.data || [],
    isLoadingTitleById: fetchTitleByIdQuery.isLoading,
    isLoadingTitles: fetchTitlesQuery.isLoading,
    isError: fetchTitlesQuery.isError,
    error: fetchTitlesQuery.error,

    // setter
    setTitleId,
    setTitleParams,

    // query
    fetchTitles: fetchTitlesQuery.refetch,
    fetchTitleById: fetchTitleByIdQuery.refetch,
    createTitle: createTitleMutation.mutate,
    updateTitle: (id: number, payload: any) => updateTitleMutation.mutate({ id, payload }),
    deleteTitle: deleteTitleMutation.mutate,
    bulkCreateTitles: bulkCreateTitlesMutation.mutate,
    bulkUpdateTitles: (ids: number[], data: any) => bulkUpdateTitlesMutation.mutate({ ids, data }),
    bulkDeleteTitles: (ids: number[]) => bulkDeleteTitlesMutation.mutate({ ids }),
  };
};
