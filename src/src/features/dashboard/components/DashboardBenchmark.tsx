import { useState, useEffect } from "react";
import { useBenchmarkActions } from "../hook/useBenchmark";
import { useDashboardCounts } from "../hook/useDashboardCounts";
import { Select, InputNumber } from "antd";
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
// import SeederControlPanel from "./SeederControlPanel";

export default function DashboardBenchmark() {
  const [loading, setLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  const [counts, setCounts] = useState<DashboardCounts | null>(null);

  // 2. State untuk menyimpan data grafik
  const [chartData, setChartData] = useState<any[]>([]);

  // State untuk memilih skenario
  const [selectedScenario, setSelectedScenario] =
    useState<BenchmarkScenario>("first");
  const [rate, setRate] = useState<number>(100);
  const [duration, setDuration] = useState<number>(5);
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
      const payload = { rate, duration };
      const graphData = await runGraphBenchmark(selectedScenario, payload);
      const sqlData = await runSqlBenchmark(selectedScenario, payload);

      // 3. Format hasil ke bentuk array object yang dibaca oleh Recharts
      const formattedData = [
        {
          name: "Database Latency",
          SQL: sqlData.db_mean_latency_ms,
          Graph: graphData.db_mean_latency_ms,
        },
        {
          name: "Success Rate",
          SQL: sqlData.success_rate,
          Graph: graphData.success_rate,
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
      case "first":
        return "Mencari data pekerjaan yang secara spesifik ditugaskan untuk jabatan (Job Title) 'Software Engineer'.";
      case "second":
        return "Mencari dan menampilkan daftar tugas yang berada di bawah naungan dokumen milik divisi 'Product'.";
      case "third":
        return "Mencari tugas-tugas di bawah divisi 'Product' yang eksekusinya secara spesifik didelegasikan kepada 'Engineering Manager'.";
      case "fourth":
        return "Menelusuri semua tugas (Job) yang di dalam kontennya memuat rujukan (referencing) ke dokumen SOP lain yang merupakan milik divisi 'Engineering'.";
      case "fifth":
        return "Mencari tugas operasional yang sudah dipublikasikan (aktif), memuat frasa teks \"mengoptimalkan\", bernaung di bawah divisi 'Product', ditugaskan kepada jabatan dengan kode warna label '#FF5733', dan memiliki rujukan ke dokumen lain, dengan hasil keluaran yang diurutkan berdasarkan indeks urutan kerja.";
      default:
        return "Skenario belum dipilih. Silakan pilih skenario untuk melihat deskripsi.";
    }
  };

  const getScenarioQueries = () => {
    switch (selectedScenario) {
      case "first":
        return {
          sql: `SELECT j.id, j.name, j.type, j.code, j.index
FROM sop_jobs j
JOIN titles t ON t.id = j.title_id
WHERE t.name = 'Engineer'
LIMIT 100;`,
          neo4j: `MATCH (j:Job)-[:ASSIGNED_TO]->(t:Title)
WHERE t.name = 'Engineer'
RETURN j.id AS id, j.name AS name, j.type AS type, j.code AS code, j.index AS index
LIMIT 100;`,
        };
      case "second":
        return {
          sql: `SELECT j.id, j.name, j.type, j.code, j.index 
FROM sop_jobs j 
JOIN sops s ON s.id = j.sop_id 
JOIN sop_divisions sd ON sd.sop_id = s.id 
JOIN divisions d ON d.id = sd.division_id 
WHERE d.name = 'Product' 
LIMIT 100;`,
          neo4j: `MATCH (d:Division)-[:HAS_SOP]->(s:SOP)-[:HAS_JOB]->(j:Job) 
WHERE d.name = 'Product' 
RETURN j.id AS id, j.name AS name, j.type AS type, j.code AS code, j.index AS index 
LIMIT 100;`,
        };
      case "third":
        return {
          sql: `SELECT j.id, j.name, j.type, j.code, j.index 
FROM sop_jobs j 
JOIN sops s ON s.id = j.sop_id 
JOIN sop_divisions sd ON sd.sop_id = s.id 
JOIN divisions d ON d.id = sd.division_id 
JOIN titles t ON t.id = j.title_id 
WHERE d.name = 'Product' AND t.name = 'Engineering Manager' 
LIMIT 100;`,
          neo4j: `MATCH (d:Division)-[:HAS_SOP]->(s:SOP)-[:HAS_JOB]->(j:Job), (j)-[:ASSIGNED_TO]->(t:Title) 
WHERE d.name = 'Product' AND t.name = 'Engineering Manager' 
RETURN j.id AS id, j.name AS name, j.type AS type, j.code AS code, j.index AS index 
LIMIT 100;`,
        };
      case "fourth":
        return {
          sql: `SELECT j.id, j.name, j.type, j.code, j.index 
FROM sop_jobs j 
JOIN sops ref_sops ON ref_sops.id = j.reference_id AND j.type = 'sop' 
JOIN sop_divisions sd ON sd.sop_id = ref_sops.id 
JOIN divisions d ON d.id = sd.division_id 
WHERE d.name = 'Engineering' 
LIMIT 100;`,
          neo4j: `MATCH (j:Job)-[:HAS_REFERENCE]->(ref:SOP)<-[:HAS_SOP]-(d:Division) 
WHERE d.name = 'Engineering' 
RETURN j.id AS id, j.name AS name, j.type AS type, j.code AS code, j.index AS index 
LIMIT 100;`,
        };
      case "fifth":
        return {
          sql: `SELECT j.id, j.name, j.type, j.code, j.index 
FROM sop_jobs j 
JOIN sops s ON s.id = j.sop_id 
JOIN sop_divisions sd ON sd.sop_id = s.id AND j.type = 'spk' 
JOIN divisions d ON d.id = sd.division_id 
JOIN spks spk ON spk.id = j.reference_id 
WHERE d.name = 'Product' 
  AND j.name LIKE '%mengoptimalkan%' 
  AND j.is_published = true 
  AND spk.name = '%tim%' 
  AND j.reference_id IS NOT NULL 
ORDER BY j.index ASC 
LIMIT 100;`,
          neo4j: `(d:Division)-[:HAS_SOP]->(s:SOP)-[:HAS_JOB]->(j:Job)-[:HAS_REFERENCE]->(ref:SPK)
WHERE d.name = 'Product' 
  AND j.name CONTAINS 'mengoptimalkan' 
  AND j.is_published = true 
  AND ref.name CONTAINS 'tim' 
RETURN j.id AS id, j.name AS name, j.type AS type, j.code AS code, j.index AS index 
ORDER BY index ASC 
LIMIT 100;`,
        };
      default:
        return { sql: "", neo4j: "" };
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

      {/* <SeederControlPanel /> */}

      {/* Statistik Cards - SQL vs Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.graph_divisions)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Titles</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.graph_titles)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SOPs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.graph_sops)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Jobs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.graph_jobs)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SPKs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.graph_spks)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Flowcharts</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.graph_flowcharts)}
                </p>
              </div>
              <div className="col-span-2 bg-emerald-600 text-white p-4 rounded-lg text-center">
                <p className="text-xs text-emerald-200 mb-1">Total Records</p>
                <p className="text-3xl font-bold">
                  {formatNumber(counts.graph_total)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Gagal memuat data
            </div>
          )}
        </div>

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
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.sql_divisions)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Titles</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.sql_titles)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SOPs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.sql_sops)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SOP Jobs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.sql_sop_jobs)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SPKs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.sql_spks)}
                </p>
              </div>
              <div className="bg-white/60 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">SPK Jobs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(counts.sql_spk_jobs)}
                </p>
              </div>
              <div className="col-span-2 bg-blue-600 text-white p-4 rounded-lg text-center">
                <p className="text-xs text-blue-200 mb-1">Total Records</p>
                <p className="text-3xl font-bold">
                  {formatNumber(counts.sql_total)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Gagal memuat data
            </div>
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
          className="w-full sm:w-[260px]"
          options={[
            { value: "first", label: "Skenario Pertama" },
            { value: "second", label: "Skenario Kedua" },
            { value: "third", label: "Skenario Ketiga" },
            { value: "fourth", label: "Skenario Keempat" },
            { value: "fifth", label: "Skenario Kelima" },
          ]}
        />

        {/* Input Rate */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Rate:</label>
          <InputNumber
            min={1}
            value={rate}
            onChange={(value) => setRate(value ?? 100)}
            disabled={loading}
            className="w-50"
            addonAfter="req/detik"
          />
        </div>

        {/* Input Duration */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Duration:</label>
          <InputNumber
            min={1}
            value={duration}
            onChange={(value) => setDuration(value ?? 5)}
            disabled={loading}
            className="w-50"
            addonAfter="detik"
          />
        </div>

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
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Menjalankan Test...
            </>
          ) : (
            "Mulai Benchmark"
          )}
        </button>
      </div>

      {/* Area Konten Utama - 2 Chart Terpisah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Database Latency */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              Database Latency
            </h2>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              Dalam ms - Lebih rendah lebih baik
            </span>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.filter((d) => d.name === "Database Latency")}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => [
                      typeof value === "number" ? `${value.toFixed(2)} ms` : value,
                      "Latency",
                    ]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar
                    dataKey="Graph"
                    fill="#10B981"
                    name="Graph (Neo4j)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Bar
                    dataKey="SQL"
                    fill="#3B82F6"
                    name="SQL (PostgreSQL)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center flex-col gap-2">
                <span className="text-4xl">🗄️</span>
                <p className="text-sm text-gray-400 font-medium">
                  Jalankan benchmark untuk melihat hasil
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chart Backend Latency */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Success Rate</h2>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
              Dalam % - Lebih tinggi lebih baik
            </span>
          </div>

          <div className="flex-1 min-h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.filter((d) => d.name === "Success Rate")}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => [
                      typeof value === "number" ? `${value.toFixed(2)} %` : value,
                      "Success Rate",
                    ]}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar
                    dataKey="Graph"
                    fill="#10B981"
                    name="Graph (Neo4j)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Bar
                    dataKey="SQL"
                    fill="#3B82F6"
                    name="SQL (PostgreSQL)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center flex-col gap-2">
                <span className="text-4xl">⚡</span>
                <p className="text-sm text-gray-400 font-medium">
                  Jalankan benchmark untuk melihat hasil
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side Area */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-6">
          Informasi Skenario
        </h2>
        <div className="text-sm text-gray-600 space-y-3">
          <p>
            <strong>Deskripsi:</strong> {getScenarioDescription()}
          </p>
          <p>
            <strong>Rate:</strong> {rate} request / detik
          </p>
          <p>
            <strong>Durasi:</strong> {duration} detik
          </p>
          <p>
            <strong>Total Request:</strong> {rate * duration} request per Database
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-xs font-semibold text-emerald-400 mb-2">Neo4j Query</p>
              <pre className="text-xs text-blue-400 whitespace-pre-wrap font-mono overflow-x-auto">
                {getScenarioQueries().neo4j}
              </pre>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-400 mb-2">PostgreSQL Query</p>
              <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono overflow-x-auto">
                {getScenarioQueries().sql}
              </pre>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-800">
            💡 <strong>Info Metrik:</strong>
            <br />• <strong>Database Latency:</strong> Waktu yang dibutuhkan
            database merespon.
            <br />• <strong>Success Rate:</strong> Persentase request yang berhasil diproses
            oleh server (termasuk network overhead).
          </div>
        </div>
      </div>
    </div>
  );
}
