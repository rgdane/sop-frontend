"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRoles, fetchRoleById, createRole, updateRole, deleteRole, bulkCreateRoles, bulkUpdateRoles, bulkDeleteRoles } from '../services/roleService';
import { useToast } from "@/components/providers/ToastProvider";
import { useState } from 'react';

export const useRoleAction = () => {
    const queryClient = useQueryClient();
    const [toast] = useToast();
    const [roleParams, setRoleParams] = useState({});

    const fetchRolesQuery = useQuery({
        queryKey: ['roles', roleParams],
        queryFn: () => fetchRoles(roleParams),
        staleTime: 5 * 60 * 1000,
    });

    const fetchRoleByIdQuery = (id: number) => useQuery({
        queryKey: ['roles', id],
        queryFn: () => fetchRoleById(id),
    })

    const createRoleMutation = useMutation({
        mutationFn: createRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success({ message: "Berhasil membuat role" });
        },
        onError: (err: any) => {
            toast.error({
                message: "Gagal membuat role",
                description: err.response?.data?.error || "Terjadi kesalahan",
            });
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: any }) =>
            updateRole(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success({ message: "Berhasil mengubah role" });
        },
        onError: (err: any) => {
            toast.error({
                message: "Gagal mengubah role",
                description: err.response?.data?.error || "Terjadi kesalahan",
            });
        },
    });

    const deleteRoleMutation = useMutation({
        mutationFn: deleteRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success({ message: "Berhasil menghapus role" });
        },
        onError: (err: any) => {
            toast.error({
                message: "Gagal menghapus role",
                description: err.response?.data?.error || "Terjadi kesalahan",
            });
        },
    });

    const bulkCreateRolesMutation = useMutation({
        mutationFn: bulkCreateRoles,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success({ message: "Berhasil membuat roles" });
        },
        onError: (err: any) => {
            toast.error({
                message: "Gagal membuat roles",
                description: err.response?.data?.error || "Terjadi kesalahan",
            });
        },
    });

    const bulkUpdateRolesMutation = useMutation({
        mutationFn: ({ ids, data }: { ids: number[]; data: any }) => bulkUpdateRoles(ids, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success({ message: "Berhasil mengupdate roles" });
        },
        onError: (err: any) => {
            toast.error({
                message: "Gagal mengupdate roles",
                description: err.response?.data?.error || "Terjadi kesalahan",
            });
        },
    });

    const bulkDeleteRolesMutation = useMutation({
        mutationFn: ({ ids, isPermanent }: { ids: number[]; isPermanent?: boolean }) => bulkDeleteRoles(ids, isPermanent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success({ message: "Berhasil menghapus roles" });
        },
        onError: (err: any) => {
            toast.error({
                message: "Gagal menghapus roles",
                description: err.response?.data?.error || "Terjadi kesalahan",
            });
        },
    });

    return {
        // data
        roles: fetchRolesQuery.data || [],
        isLoadingRoles: fetchRolesQuery.isLoading,
        isError: fetchRolesQuery.isError,
        error: fetchRolesQuery.error,

        setRoleParams,

        // query
        fetchRoles: (params?: any) => fetchRolesQuery.refetch(params),
        fetchRoleById: (id: number) => fetchRoleByIdQuery(id).data,
        createRole: createRoleMutation.mutate,
        updateRole: (id: number, payload: any) => updateRoleMutation.mutate({ id, payload }),
        deleteRole: deleteRoleMutation.mutate,
        bulkCreateRoles: bulkCreateRolesMutation.mutate,
        bulkUpdateRoles: (ids: number[], data: any) => bulkUpdateRolesMutation.mutate({ ids, data }),
        bulkDeleteRoles: (ids: number[]) => bulkDeleteRolesMutation.mutate({ ids }),
    };
};