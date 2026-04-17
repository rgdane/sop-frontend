"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/navigation"; // Jika kamu pakai Next.js 13+ app router

const Pages = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const renderDashboard = () => {
    // Handling jika user belum ter-load atau null
    if (!user) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-500 animate-pulse">Memuat data pengguna...</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6 sm:p-10 space-y-8">
        
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Selamat datang kembali, <span className="font-semibold text-blue-600">{user.name || "User"}</span>!
            </p>
          </div>
          
          {/* Tombol Akses Cepat */}
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-sm font-medium">
              + Buat SOP Baru
            </button>
          </div>
        </div>

        {/* 2. Statistik Cards (Ringkasan Data) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Divisi" value="12" icon="🏢" color="border-blue-100 bg-blue-50/50" />
          <StatCard title="Total SOP" value="148" icon="📄" color="border-green-100 bg-green-50/50" />
          <StatCard title="SOP Aktif" value="120" icon="✅" color="border-yellow-100 bg-yellow-50/50" />
          <StatCard title="Pengguna" value="45" icon="👥" color="border-purple-100 bg-purple-50/50" />
        </div>

        {/* 3. Area Konten Utama (Bisa untuk Benchmark Chart!) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Area (Lebih lebar) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">Performa Database (SQL vs Graph)</h2>
              <button className="text-sm text-blue-600 hover:underline">Jalankan Ulang Tes</button>
            </div>
            
            {/* Placeholder untuk Grafik Recharts/ApexCharts nantinya */}
            <div className="h-64 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center flex-col gap-2">
              <span className="text-4xl">📊</span>
              <p className="text-sm text-gray-400 font-medium">Grafik Benchmark akan tampil di sini</p>
            </div>
          </div>

          {/* Side Area (Activity / Recent SOP) */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Aktivitas Terbaru</h2>
            <div className="space-y-4">
              {/* Contoh List Dummy */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                    SOP
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Update SOP IT Support</p>
                    <p className="text-xs text-gray-500">2 jam yang lalu oleh Admin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  };

  return <>{renderDashboard()}</>;
};

export default Pages;

// --- Komponen Bantuan (Bisa dipisah ke file komponen terpisah nanti) ---

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className={`p-6 rounded-xl border shadow-sm flex items-center gap-4 ${color}`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);