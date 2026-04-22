import { useState } from "react";
import { useBenchmarkActions } from "../hook/useBenchmark";
import StatCard from "./StatCard";
import { Select } from "antd"; // <-- Import Ant Design Select

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

export default function DashboardBenchmark() {
  const [loading, setLoading] = useState(false);

  // 2. State untuk menyimpan data grafik
  const [chartData, setChartData] = useState<any[]>([]);

  // State untuk memilih skenario
  const [selectedScenario, setSelectedScenario] = useState<BenchmarkScenario>('divisions');
  const { runSqlBenchmark, runGraphBenchmark } = useBenchmarkActions();

  // Helper: Format latency ke ms
  const parseLatencyToMs = (timeStr: string) => {
    if (!timeStr) return 0;
    if (timeStr.includes("µs")) return parseFloat(timeStr) / 1000;
    if (timeStr.includes("ms")) return parseFloat(timeStr);
    if (timeStr.includes("s")) return parseFloat(timeStr) * 1000;
    return parseFloat(timeStr);
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

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Divisi" value="12" icon="🏢" color="border-yellow-100 bg-yellow-50/50" />
        <StatCard title="Total SOP" value="148" icon="📄" color="border-purple-100 bg-purple-50/50" />
        <StatCard title="Total SPK" value="148" icon="📄" color="border-green-100 bg-green-50/50" />
        <StatCard title="Total Jabatan" value="120" icon="✅" color="border-yellow-100 bg-yellow-50/50" />
        <StatCard title="Total SOP Job" value="45" icon="👥" color="border-purple-100 bg-purple-50/50" />
        <StatCard title="Total SPK Job" value="45" icon="👥" color="border-green-100 bg-green-50/50" />
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
                  <Bar dataKey="SQL" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="Graph" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
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
              <strong>Rate:</strong> 50 request / detik
            </p>
            <p>
              <strong>Durasi:</strong> 5 detik
            </p>
            <p>
              <strong>Total Request:</strong> 250 request per Database
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