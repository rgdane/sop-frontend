type NodeData = {
    id?: number | string; // Node ID
    elementId?: string; // parent
    labels?: string[]; // Entity Label
    props: Record<string, any>; // Data
    relationship?: string;
    documentId?: string;
}

export type GraphNode = {
    elementId?: string | null;
    node: NodeData
}

export default NodeData