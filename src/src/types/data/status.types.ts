import { Position } from "./position.types";

export type Status = {
    id : number;
    name: string;
    category: "To-Do" | "In Progress" | "Complete";
    position_id: number;
    index: number;
    color: string;
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
    has_position?: Position;
};