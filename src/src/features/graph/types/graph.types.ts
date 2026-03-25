export type ColumnData = {
    name?: string;
    nodeType?: string;
    tableRef?: string;
    graphRef?: string;
    index?: number;
    options?: any[];
}

export type TableData = {
    has_job?: any[];
    has_column?: any[];
    rows?: any;
    nodeType?: string;
    tableRef?: string;
    productId?: number;
    projectId?: number;
    epicId?: number;
    documentId?: number;
    documentName?: string;
    elementId?: string;
}

export type NodeData = {
    id?: string;
    elementId?: string;
    labels?: string[];
    props: Record<string, any>;
    has_column?: TableData[];
    relationship?: string;  
}

export type CreateGraph = {
    elementId: string;
    node: NodeData;
}