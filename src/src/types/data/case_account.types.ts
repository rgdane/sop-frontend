import { CaseReport } from "./case_report.types";
import { CaseAccountOutlet } from "./case_account_outlet.types";

export interface CaseAccount {
  id: number;
  owner_id: string;
  name: string;
  email: string;
  phone: string;
  reporter: string;
  phone_reporter: string;
  case_report_id: number;
  has_outlet: CaseAccountOutlet[];
  created_at?: string;
  updated_at?: string;
}