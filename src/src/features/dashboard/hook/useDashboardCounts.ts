"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { benchmarkService } from "../services/benchmarkService";
import { DashboardCounts } from "@/types/data/benchmark.types";

export const useDashboardCounts = () => {
  const [toast] = useToast();

  const getDashboardCounts = async (): Promise<DashboardCounts | null> => {
    try {
      const res = await benchmarkService.getDashboardCounts();
      return res.data.data;
    } catch (err: any) {
      toast.error({
        message: "Gagal mengambil data dashboard counts",
        description: err.response?.data?.error || err.message,
      });
      return null;
    }
  };

  return {
    getDashboardCounts,
  };
};