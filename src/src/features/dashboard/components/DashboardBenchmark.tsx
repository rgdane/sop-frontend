import { useState, useEffect } from "react";
import { useBenchmarkActions } from "../hook/useBenchmark";
import { useDashboardCounts } from "../hook/useDashboardCounts";
import { Select } from "antd";
import { DashboardCounts } from "@/types/data/benchmark.types";

// 1. Import komponen dari recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BenchmarkScenario } from "../services/benchmarkService";
import SeederControlPanel from "./SeederControlPanel";

export default function DashboardBenchmark() {
  const [loading, setLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  const [counts, setCounts] = useState<DashboardCounts | null>(null);

  // 2. State untuk menyimpan data grafik
  const [chartData, setChartData] = useState<any[]>([]);

  // State untuk memilih skenario
  const [selectedScenario, setSelectedScenario] = useState<BenchmarkScenario>('divisions');
  const { runSqlBenchmark, runGraphBenchmark } = useBenchmarkActions();
  const { getDashboardCounts } = useDashboardCounts();

  useEffect(() => {
    const fetchCounts = async () => {
      setCountsLoading(true);
      const data = await getDashboardCounts();
      setCounts(data);
      setCountsLoading(false);
    };
    fetchCounts();
  }, []);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString("id-ID");
  };

  // Helper: Format latency ke ms
  const parseLatencyToMs = (timeStr: string) => {
    if (!timeStr) return 0;
    let result: number;
    if (timeStr.includes("µs")) result = parseFloat(timeStr) / 1000;
    else if (timeStr.includes("ms")) result = parseFloat(timeStr);
    else if (timeStr.includes("s")) result = parseFloat(timeStr) * 1000;
    else result = parseFloat(timeStr);
    return parseFloat(result.toFixed(2));
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      // Jalankan test SQL & Graph berdasarkan skenario yang dipilih
      const sqlData = await runSqlBenchmark(selectedScenario);
      const graphData = await runGraphBenchmark(selectedScenario);

      // 3. Format hasil ke bentuk array object yang dibaca oleh Recharts
      const formattedData = [
        {
          name: "Database Latency",
          SQL: sqlData.db_mean_latency_ms,
          Graph: graphData.db_mean_latency_ms,
        },
        {
          name: "Backend Latency",
          SQL: parseLatencyToMs(sqlData.vegeta_mean_latency),
          Graph: parseLatencyToMs(graphData.vegeta_mean_latency),
        },
      ];

      // Simpan ke state
      setChartData(formattedData);
    } catch (error) {
      console.error("Gagal menjalankan benchmark:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk menampilkan info dinamis di Sidebar
  const getScenarioDescription = () => {
    switch (selectedScenario) {
      case "divisions":
        return "GET /divisions (Tabel tunggal, minim relasi)";
      case "sops":
        return "GET /sops (Relasi menengah ke tabel Divisi)";
      case "sop-jobs":
        return "GET /sop-jobs (Relasi kompleks, struktur Linked-List)";
      default:
        return "Endpoint Get All Data";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 rounded-lg dark:bg-slate-panel p-6 sm:p-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-500">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Selamat datang kembali,{" "}
            <span className="font-semibold text-orange-500">{"User"}</span>!
          </p>
        </div>
      </div>

      <SeederControlPanel />

      {/* Statistik Cards - SQL vs Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SQL Database Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🗄️</span> Database SQL (PostgreSQL)
          </h3>
          {countsLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : counts ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Divisions</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.sql_divisions)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Titles</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.sql_titles)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SOPs</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.sql_sops)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SOP Jobs</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.sql_sop_jobs)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SPKs</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.sql_spks)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SPK Jobs</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.sql_spk_jobs)}</p>
              </div>
              <div className="col-span-2 bg-blue-600 text-white p-4 rounded-lg text-center">
                <p className="text-xs text-blue-200 mb-1">Total Records</p>
                <p className="text-3xl font-bold">{formatNumber(counts.sql_total)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">Gagal memuat data</div>
          )}
        </div>

        {/* Graph Database Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 shadow-sm">
          <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔗</span> Database Graph (Neo4j)
          </h3>
          {countsLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
          ) : counts ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Divisions</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.graph_divisions)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Titles</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.graph_titles)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SOPs</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.graph_sops)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Jobs</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.graph_jobs)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SPKs</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.graph_spks)}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Flowcharts</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(counts.graph_flowcharts)}</p>
              </div>
              <div className="col-span-2 bg-emerald-600 text-white p-4 rounded-lg text-center">
                <p className="text-xs text-emerald-200 mb-1">Total Records</p>
                <p className="text-3xl font-bold">{formatNumber(counts.graph_total)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">Gagal memuat data</div>
          )}
        </div>
      </div>

      {/* Tombol Action & Dropdown Skenario */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
        {/* Dropdown Pilihan Skenario dengan Ant Design */}
        <Select
          size="large"
          value={selectedScenario}
          onChange={(value) => setSelectedScenario(value as BenchmarkScenario)}
          disabled={loading}
          className="w-full sm:w-[260px]" // Atur lebar agar pas di mobile dan desktop
          options={[
            { value: "divisions", label: "Skenario Sederhana (Divisi)" },
            { value: "sops", label: "Skenario Menengah (SOP)" },
            { value: "sop-jobs", label: "Skenario Kompleks (SOP Jobs)" },
          ]}
        />

        {/* Tombol Benchmark */}
        <button
          onClick={handleTest}
          disabled={loading}
          className="w-full sm:w-auto px-6 h-[40px] bg-orange-400 text-white rounded-lg shadow hover:bg-orange-500 transition text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menjalankan Test...
            </>
          ) : (
            "Mulai Benchmark"
          )}
        </button>
      </div>

      {/* Area Konten Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              Performa Latency (Beban 5 Detik)
            </h2>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              Dalam Milliseconds (ms) - Lebih rendah lebih baik
            </span>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="Graph" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="SQL" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center flex-col gap-2">
                <span className="text-4xl">📊</span>
                <p className="text-sm text-gray-400 font-medium">
                  Pilih skenario dan klik "Mulai Benchmark" untuk melihat perbandingan
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side Area */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            Informasi Skenario
          </h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              <strong>Target:</strong> {getScenarioDescription()}
            </p>
            <p>
              <strong>Rate:</strong> 100 request / detik
            </p>
            <p>
              <strong>Durasi:</strong> 5 detik
            </p>
            <p>
              <strong>Total Request:</strong> 500 request per Database
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-800">
              💡 <strong>Info Metrik:</strong>
              <br />• <strong>Database Latency:</strong> Waktu rata-rata yang
              dibutuhkan database merespon.
              <br />• <strong>Backend Latency:</strong> Waktu rata-rata yang
              dibutuhkan server merespon.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}