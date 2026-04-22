"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { benchmarkService, BenchmarkScenario } from "../services/benchmarkService";
import { Benchmark } from "@/types/data/benchmark.types";

export const useBenchmarkActions = () => {
  const [toast] = useToast();

  const runSqlBenchmark = async (scenario: BenchmarkScenario): Promise<Benchmark> => {
    try {
      const res = await benchmarkService.runTestSQL(scenario);
      
      toast.success({ 
        message: `Benchmark SQL (${scenario}) berhasil diselesaikan!` 
      });
      
      return res.data.data; 
    } catch (err: any) {
      toast.error({
        message: `Gagal menjalankan benchmark SQL (${scenario})`,
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  const runGraphBenchmark = async (scenario: BenchmarkScenario): Promise<Benchmark> => {
    try {
      const res = await benchmarkService.runTestGraph(scenario);
      
      toast.success({ 
        message: `Benchmark Graph (${scenario}) berhasil diselesaikan!` 
      });
      
      return res.data.data; 
    } catch (err: any) {
      toast.error({
        message: `Gagal menjalankan benchmark Graph (${scenario})`,
        description: err.response?.data?.error || err.message,
      });
      throw err;
    }
  };

  return {
    runSqlBenchmark,
    runGraphBenchmark,
  };
};