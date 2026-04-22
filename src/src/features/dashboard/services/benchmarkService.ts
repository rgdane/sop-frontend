import axiosInstance from "@/config/axios";
import { Benchmark } from "@/types/data/benchmark.types";

// Buat union type untuk memastikan pilihan skenario valid
export type BenchmarkScenario = 'divisions' | 'sops' | 'sop-jobs';

export const benchmarkService = {
  // Terima parameter scenario dan masukkan ke dalam URL
  runTestSQL: (scenario: BenchmarkScenario) => 
    axiosInstance.get<{ data: Benchmark }>(`/benchmark/${scenario}/sql`),
  
  runTestGraph: (scenario: BenchmarkScenario) => 
    axiosInstance.get<{ data: Benchmark }>(`/benchmark/${scenario}/graph`),
};