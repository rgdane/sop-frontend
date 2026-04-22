import { useState } from "react";
import { Select } from "antd";
import { useSeederActions } from "../hook/useSeeder";

export default function SeederControlPanel() {
  // Panggil semua fungsi dari hook yang sudah kita buat
  const { isSeeding, runAllSeeders, runMasterSeeder, runParentSeeder, runJobSeeder } = useSeederActions();

  // State untuk menyimpan pilihan dropdown
  const [selectedSeeder, setSelectedSeeder] = useState<string>("all");

  // Fungsi untuk mengeksekusi seeder berdasarkan pilihan dropdown
  const handleRunSeeder = async () => {
    switch (selectedSeeder) {
      case "all":
        await runAllSeeders();
        break;
      case "master":
        await runMasterSeeder();
        break;
      case "parent":
        await runParentSeeder();
        break;
      case "job":
        await runJobSeeder();
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Database Seeder</h2>
        <p className="text-sm text-gray-500">
          Isi database dengan data dummy sebelum menjalankan benchmark. 
          <br/>
          <span className="text-orange-500 font-semibold">Catatan:</span> Jika database kosong, jalankan "Semua Data (Berurutan)" untuk menghindari error Foreign Key.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
        {/* Dropdown Ant Design */}
        <Select
          size="large"
          value={selectedSeeder}
          onChange={(value) => setSelectedSeeder(value)}
          disabled={isSeeding}
          className="w-full sm:w-[280px]"
          options={[
            { value: "all", label: "Semua Data (Berurutan)" },
            { value: "master", label: "Hanya Master Data (Divisions & Titles)" },
            { value: "parent", label: "Hanya Parent Data (SOPs & SPKs)" },
            { value: "job", label: "Hanya Job Data (SOP Jobs & SPK Jobs)" },
          ]}
        />

        {/* Tombol Eksekusi */}
        <button
          onClick={handleRunSeeder}
          disabled={isSeeding}
          className="w-full sm:w-auto px-6 h-[40px] bg-orange-400 text-white rounded-lg shadow hover:bg-orange-500 transition text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSeeding ? (
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
              Sedang Seeding...
            </>
          ) : (
            "Jalankan Seeder"
          )}
        </button>
      </div>
    </div>
  );
}