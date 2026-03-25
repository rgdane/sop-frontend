export interface TableData {
    _elementId: string;
    _id: number;
    _type: string;
    has_column: Column[];
    id: string;
    name: string;
}

export interface Column {
    _elementId: string;
    _id: number;
    _type: string;
    has_column: {
        _elementId: string;
        _id: number;
    };
    has_row?: Row[];
    index: number;
    key: string;
    name: string;
    nodeType: 'text' | 'option' | 'number' | 'date';
    options: string;
}

export interface Row {
    _elementId: string;
    _id: number;
    _type: string;
    has_row: {
        _elementId: string;
        _id: number;
    };
    rowIndex: number;
    value: string;
}

export interface ApiResponse {
    data: TableData;
    success: boolean;
}

export interface DatabaseAttributes {
    tableId: string;
    apiEndpoint: string;
}