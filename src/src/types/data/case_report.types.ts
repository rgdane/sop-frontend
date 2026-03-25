import { JSONContent } from "@tiptap/core";

export type CaseReport = {
    id: number;
    case_id?: number;
    description: string;
    has_categories: CaseCategory[];
    has_bug_features: number[];
    done_estimate: string;
    request_date: string;
    type: "BUG" | "SARAN" | "REQUEST";
    priority: "LOW" | "MEDIUM" | "URGENT";
    severity: "Critical" | "High" | "Medium" | "Low" | "Trivial";
    note: string;
    response: JSONContent;
    has_technicians: number[];
    case_status_id: number;
    has_attachments: any;
    has_assigned_users: number[];

    created_at: string;
    created_by: number;
    deleted_at: string | null;
}

export type CaseAccountOutlet = {
    id: number;
    outlet_id: string;
    name: string;
    address: string;
    case_account_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export type CaseAccount = {
    id: number;
    name: string;
    email: string;
    phone: string;
    outlet: string;
    case_report_id: number;
    has_outlet?: CaseAccountOutlet[];
    reporter?: string;
    phone_reporter?: string;
}

export type CaseAttachment = {
    id: number;
    attachment: string;
    type: "TECHNICAL" | "GENERAL";
    case_report_id: number;
}

export type CaseCategory = {
    id: number;
    name: string;
    case_report_id: number;
}

export type CaseBugFeature = {
    id: number;
    name: string;
    case_report_id: number;
    color: string;
}
