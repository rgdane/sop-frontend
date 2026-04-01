"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from "@/components/providers/ToastProvider";
import { bulkCreateDivisions, bulkDeleteDivisions, bulkUpdateDivisions, createDivision, deleteDivision, fetchDivisionById, fetchDivisions, updateDivision } from '../services/divisionSqlService';

export const useDivisionActions = () => {
  const queryClient = useQueryClient();
  const [toast] = useToast();
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [divisionParams, setDivisionParams] = useState<Record<string, any>>({})

  const fetchDivisionsQuery = useQuery({
    queryKey: ['divisions', divisionParams],
    queryFn: () => fetchDivisions(divisionParams),
    staleTime: 5 * 60 * 1000,
  });

  const fetchDivisionByIdQuery = useQuery({
    queryKey: ['division', divisionId],
    queryFn: async () => {
      return await fetchDivisionById(divisionId!, divisionParams);
    },
    enabled: !!divisionId,
    staleTime: 5 * 60 * 1000,
  });

  const createDivisionMutation = useMutation({
    mutationFn: createDivision,
    onSuccess: () => {
      toast.success({ message: "Berhasil membuat data" });
      queryClient.invalidateQueries({ queryKey: ['divisions', divisionParams] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal membuat data",
        description: err?.response?.data?.error,
      });
    },
  });

  const updateDivisionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => updateDivision(id, payload),
    onSuccess: () => {
      toast.success({ message: "Berhasil mengubah data" });
      queryClient.invalidateQueries({ queryKey: ['divisions', divisionParams] });
      queryClient.invalidateQueries({ queryKey: ['division'] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal mengubah data",
        description: err?.response?.data?.error,
      });
    },
  });

  const deleteDivisionMutation = useMutation({
    mutationFn: deleteDivision,
    onSuccess: () => {
      toast.success({ message: "Berhasil menghapus data" });
      queryClient.invalidateQueries({ queryKey: ['divisions', divisionParams] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal menghapus data",
        description: err?.response?.data?.error,
      });
    },
  });

  const bulkCreateDivisionsMutation = useMutation({
    mutationFn: bulkCreateDivisions,
    onSuccess: (data, variables) => {
      toast.success({
        message: `Berhasil membuat ${variables.length} data`,
      });
      queryClient.invalidateQueries({ queryKey: ['divisions', divisionParams] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal melakukan bulk create",
        description: err.response?.data?.error || err.message,
      });
    },
  });

  const bulkUpdateDivisionsMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: number[]; data: any }) => bulkUpdateDivisions(ids, data),
    onSuccess: () => {
      toast.success({
        message: `Berhasil mengupdate datas`,
      });
      queryClient.invalidateQueries({ queryKey: ['divisions', divisionParams] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
    },
  });

  const bulkDeleteDivisionsMutation = useMutation({
    mutationFn: ({ ids }: { ids: number[] }) => bulkDeleteDivisions(ids),
    onSuccess: () => {
      toast.success({
        message: `Berhasil menghapus datas`,
      });
      queryClient.invalidateQueries({ queryKey: ['divisions', divisionParams] });
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
    division: fetchDivisionByIdQuery.data,
    divisions: fetchDivisionsQuery.data || [],
    isLoadingDivisionById: fetchDivisionByIdQuery.isLoading,
    isLoadingDivisions: fetchDivisionsQuery.isLoading,
    isError: fetchDivisionsQuery.isError,
    error: fetchDivisionsQuery.error,

    // setter
    setDivisionId,
    setDivisionParams,

    // query
    fetchDivisions: fetchDivisionsQuery.refetch,
    fetchDivisionById: fetchDivisionByIdQuery.refetch,
    createDivision: createDivisionMutation.mutate,
    updateDivision: (id: number, payload: any) => updateDivisionMutation.mutate({ id, payload }),
    deleteDivision: deleteDivisionMutation.mutate,
    bulkCreateDivisions: bulkCreateDivisionsMutation.mutate,
    bulkUpdateDivisions: (ids: number[], data: any) => bulkUpdateDivisionsMutation.mutate({ ids, data }),
    bulkDeleteDivisions: (ids: number[]) => bulkDeleteDivisionsMutation.mutate({ ids }),
  };
};
