import { JSONContent } from "@tiptap/core";

export type Job = {
    id: number;
    title: string;
    instruction: JSONContent;
    guide: JSONContent;
    sop_id: number;
    spk_id: number;
    created_at: string;
    updated_at: string;
}