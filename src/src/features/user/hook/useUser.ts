"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  fetchUsers as fetchUsersFn,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkCreateUsers,
  bulkUpdateUsers,
  bulkDeleteUsers
} from '../services/userService';
import { useToast } from "@/components/providers/ToastProvider";

export const useUserAction = () => {
  const queryClient = useQueryClient();
  const [toast] = useToast();
  const [params, setUserParams] = useState<Record<string, any>>({});

  const fetchUsersQuery = useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsersFn(params),
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data, variables) => {
      toast.success({ message: `Berhasil menambahkan ${variables.name}` });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal membuat User",
        description: err.response?.data?.error,
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => {
      const formattedPayload = {
        ...payload,
        ...(payload.password != "" && { password: payload.password }),
      };
      return updateUser(id, formattedPayload);
    },
    onSuccess: () => {
      toast.success({ message: "Berhasil mengubah User" });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal mengubah User",
        description: err.response?.data?.error,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: ({ id, isPermanent }: { id: number; isPermanent?: boolean }) => deleteUser(id, isPermanent),
    onSuccess: () => {
      toast.success({ message: "Berhasil menghapus User" });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal menghapus User",
        description: err.response?.data?.error,
      });
    },
  });

  const bulkCreateUsersMutation = useMutation({
    mutationFn: bulkCreateUsers,
    onSuccess: (data, variables) => {
      variables.forEach((item) => {
        toast.success({
          message: `Berhasil menambahkan ${item.name}`,
        });
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal melakukan bulk create",
        description: err.response?.data?.error || err.message,
      });
    },
  });

  const bulkUpdateUsersMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: number[]; data: any }) => bulkUpdateUsers(ids, data),
    onSuccess: () => {
      toast.success({
        message: `Berhasil mengupdate users`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal melakukan bulk update",
        description: err.response?.data?.error || err.message,
      });
    },
  });

  const bulkDeleteUsersMutation = useMutation({
    mutationFn: ({ ids, isPermanent }: { ids: number[]; isPermanent?: boolean }) => bulkDeleteUsers(ids, isPermanent),
    onSuccess: () => {
      toast.success({
        message: `Berhasil menghapus users`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error({
        message: "Gagal melakukan bulk delete",
        description: err.response?.data?.error || err.message,
      });
    },
  });

  const setUserParamsFn = useCallback((params: Record<string, any>) => {
    setUserParams(params);
  }, []);

  return {
    // data
    users: fetchUsersQuery.data?.data || [],
    total: fetchUsersQuery.data?.total || 0,
    isLoadingUsers: fetchUsersQuery.isLoading,
    isError: fetchUsersQuery.isError,
    error: fetchUsersQuery.error,

    // setter
    setUserParams: setUserParamsFn,

    // action
    fetchUsers: (nextParams?: Record<string, any>) => {
      const targetParams = nextParams ?? params;
      if (nextParams) {
        setUserParams(nextParams);
      }
      return queryClient.fetchQuery({
        queryKey: ['users', targetParams],
        queryFn: () => fetchUsersFn(targetParams),
      });
    },
    fetchUserById,
    createUser: createUserMutation.mutate,
    updateUser: (id: number, payload: any) => updateUserMutation.mutate({ id, payload }),
    deleteUser: deleteUserMutation.mutate,
    bulkCreateUsers: bulkCreateUsersMutation.mutate,
    bulkUpdateUsers: (ids: number[], data: any) => bulkUpdateUsersMutation.mutate({ ids, data }),
    bulkDeleteUsers: (ids: number[], isPermanent?: boolean) => bulkDeleteUsersMutation.mutate({ ids, isPermanent }),
  };
};
