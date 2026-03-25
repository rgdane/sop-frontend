export type CreatePositionDto = {
    name: string;
    code: string;
    color: string;
    division_id: number;
}

export type UpdatePositionDto = {
    name?: string;
    color: string;
    division_id?: number;
}