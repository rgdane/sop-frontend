export type Benchmark = {
  test_name: string;
  target: string;
  requests: number;
  success_rate: number;
  db_mean_latency_ms: string;
  vegeta_mean_latency: string;
  p99_latency: string;
}