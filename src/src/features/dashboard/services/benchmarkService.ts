import axiosInstance from "@/config/axios";
import { Benchmark, DashboardCounts } from "@/types/data/benchmark.types";

// Buat union type untuk memastikan pilihan skenario valid
export type BenchmarkScenario = 'first' | 'second' | 'third' | 'fourth' | 'fifth';

export interface BenchmarkPayload {
  rate: number;
  duration: number;
}

export const benchmarkService = {
  runTestSQL: (scenario: BenchmarkScenario, payload: BenchmarkPayload) =>
    axiosInstance.get<{ data: Benchmark }>(`/benchmark/${scenario}/sql`, { params: payload }),

  runTestGraph: (scenario: BenchmarkScenario, payload: BenchmarkPayload) =>
    axiosInstance.get<{ data: Benchmark }>(`/benchmark/${scenario}/graph`, { params: payload }),

  getDashboardCounts: () =>
    axiosInstance.get<{ data: DashboardCounts }>('/dashboard/counts'),
};