import { JSONContent } from "@tiptap/core";
import { Spk } from "./spk.types";
import { User } from "./user.types";
import { Project } from "./project.types";

export type SpkTx = {
  id: number;
  description?: JSONContent; // Content
  code?: string;
  status: "unread" | "onread" | "approved" | "rejected" | "draft";
  start_date: string;
  end_date: string;
  rejected_reason: string;
  current_version: number;

  current_description?: JSONContent;
  current_version_id?: number;
  project_id: number;
  spk_id: number;
  user_target_id: number;
  user_origin_id: number;

  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;

  has_versions?: SpkTxVersion[];
  has_user_target?: User;
  has_user_origin?: User;
  has_spk: Spk;
  has_project: Project;
};

export type SpkTxVersion = {
  id: number;
  version: number;
  description: JSONContent;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  has_spk_tx_results: SpkTxResult[];
  has_spk_tx: SpkTx;
}
export type SpkTxResult = {
  id: number;
  name: string;
  status: "todo" | "in_progress" | "done";

  spk_tx_version_id: number;

  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}


export const SPKTxStatusMap: Record<SpkTx["status"], string> = {
  unread: "Belum Dibaca",
  onread: "Sedang Dibaca",
  approved: "Diterima",
  rejected: "Ditolak",
  draft: "Draft",
};

export const SPKTxStatusColorMap: Record<SpkTx["status"], string> = {
  unread: "#2563EB",         // Netral, belum ada aksi
  onread: "#F59E0B",      // Sedang diproses/dilihat
  approved: "#10B981",    // Diterima, hasil positif
  rejected: "#EF4444",       // Ditolak, hasil negatif
  draft: "#78716c",     // Masih konsep/mentah
};

export const SPKTxResultStatusMap: Record<SpkTxResult["status"], string> = {
  todo: "To-Do",
  in_progress: "Sedang dikerjakan",
  done: "Selesai",
};

export const SPKTxResultStatusColorMap: Record<SpkTxResult["status"], string> = {
  todo: "#6B7280",      // Netral, belum ada aksi
  in_progress: "#F59E0B",      // Sedang diproses/dilihat
  done: "#10B981",    // Diterima, hasil positif
  // reject: "#EF4444",       // Ditolak, hasil negatif
  // draft: "#14B8A6",     // Masih konsep/mentah
};

