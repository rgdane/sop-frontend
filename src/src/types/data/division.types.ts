import { Department } from "./department.types";
import { Position } from "./position.types";

export type Division = {
    id: number;
    name: string;
    code: string;
    department_id: number;
    created_at?: string;
    updated_at?: string;
    department?: Department;
    positions?: Position[];
    deleted_at?: string | null;
}