"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { seederService } from "../services/seederService";
import { useState } from "react";

export const useSeederActions = () => {
  const [toast] = useToast();
  // State global untuk loading agar bisa dipakai di tombol frontend
  const [isSeeding, setIsSeeding] = useState(false);

  const runMasterSeeder = async () => {
    try {
      const res = await seederService.seedMasterData();
      toast.success({ message: "Seeder Master (Divisions & Titles) Berhasil!" });
      return res.data;
    } catch (err: any) {
      toast.error({
        message: "Gagal seeding Master Data",
        description: err.response?.data?.message || err.message,
      });
      throw err;
    }
  };

  const runParentSeeder = async () => {
    try {
      const res = await seederService.seedParentData();
      toast.success({ message: "Seeder Parent (SOPs & SPKs) Berhasil!" });
      return res.data;
    } catch (err: any) {
      toast.error({
        message: "Gagal seeding Parent Data",
        description: err.response?.data?.message || err.message,
      });
      throw err;
    }
  };

  const runJobSeeder = async () => {
    try {
      const res = await seederService.seedJobData();
      toast.success({ message: "Seeder Jobs (SOP Jobs & SPK Jobs) Berhasil!" });
      return res.data;
    } catch (err: any) {
      toast.error({
        message: "Gagal seeding Job Data",
        description: err.response?.data?.message || err.message,
      });
      throw err;
    }
  };

  // Fungsi utilitas untuk menjalankan semua seeder secara berurutan
  // Sangat berguna untuk memastikan Foreign Key (SQL) tidak error
  const runAllSeeders = async () => {
    setIsSeeding(true);
    try {
      toast.info({ message: "Memulai proses Seeding Data..." });
      
      // 1. Eksekusi Master (Divisions, Titles)
      await runMasterSeeder();
      
      // 2. Eksekusi Parent (SOPs, SPKs) - Butuh ID dari Master
      await runParentSeeder();
      
      // 3. Eksekusi Jobs (SOP Jobs, SPK Jobs) - Butuh ID dari Parent & Master
      await runJobSeeder();

      toast.success({ 
        message: "Semua Seeder berhasil dieksekusi!",
        description: "Database sudah siap untuk di-benchmark."
      });
    } catch (err) {
      toast.error({ 
        message: "Proses Seeding Berhenti", 
        description: "Terjadi kesalahan pada salah satu tahap seeder." 
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return {
    isSeeding,
    runMasterSeeder,
    runParentSeeder,
    runJobSeeder,
    runAllSeeders,
  };
};