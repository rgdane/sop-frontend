export type Benchmark = {
  test_name: string;
  target: string;
  requests: number;
  success_rate: number;
  db_mean_latency_ms: string;
  vegeta_mean_latency: string;
  p99_latency: string;
}

export type DashboardCounts = {
  sql_divisions: number;
  sql_titles: number;
  sql_flowcharts: number;
  sql_sops: number;
  sql_sop_jobs: number;
  sql_spks: number;
  sql_spk_jobs: number;
  sql_total: number;
  graph_divisions: number;
  graph_titles: number;
  graph_flowcharts: number;
  graph_sops: number;
  graph_jobs: number;
  graph_spks: number;
  graph_total: number;
}