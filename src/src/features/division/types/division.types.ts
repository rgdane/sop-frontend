export type CreateDivisionDto = {
    name: string;
    code: string;
    department_id: number;
}

export type UpdateDivisionDto = {
    name?: string;
    code?: string;
    department_id?: number;
}