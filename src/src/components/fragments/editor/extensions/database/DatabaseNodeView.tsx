import React, { useState, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { ChevronDown, ChevronRight, Plus, AlertCircle, RefreshCw } from 'lucide-react';

interface TableData {
    _elementId: string;
    _id: number;
    _type: string;
    has_column: Column[];
    id: string;
    name: string;
}

interface Column {
    _elementId: string;
    _id: number;
    _type: string;
    has_row?: Row[];
    index: number;
    key: string;
    name: string;
    nodeType: string;
    options: string;
}

interface Row {
    _elementId: string;
    _id: number;
    _type: string;
    rowIndex: number;
    value: string;
}

interface DatabaseAttrs {
    tableId: string;
    apiEndpoint: string;
    elementId?: string;
    tableName?: string;
}

export const DatabaseNodeView: React.FC<NodeViewProps> = ({
    node,
    updateAttributes,
    deleteNode,
    selected,
}) => {
    const [tableData, setTableData] = useState<TableData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState(false);

    // Type assertion for attrs
    const { tableId, apiEndpoint, elementId, tableName } = node.attrs as DatabaseAttrs;

    useEffect(() => {
        if (tableId) {
            loadTableData();
        }
    }, [tableId, apiEndpoint]);

    const loadTableData = async () => {
        setLoading(true);
        setError(null);

        try {
            const url = `${apiEndpoint}${tableId}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                setTableData(result.data);

                // Update attributes dengan data yang di-fetch (untuk persistence)
                updateAttributes({
                    elementId: result.data._elementId,
                    tableName: result.data.name,
                });
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error loading table:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const parseColumns = (columns: Column[]): Column[] => {
        if (!columns) return [];
        return [...columns].sort((a, b) => a.index - b.index);
    };

    const getCellValue = (column: Column, rowIndex: number): string => {
        const row = column.has_row?.find(r => r.rowIndex === rowIndex);
        return row?.value || '';
    };

    const getMaxRows = (columns: Column[]): number => {
        let max = 0;
        columns.forEach(col => {
            col.has_row?.forEach(row => {
                if (row.rowIndex > max) max = row.rowIndex;
            });
        });
        return max;
    };

    const renderCellContent = (column: Column, value: string) => {
        if (!value) {
            return <span className="text-gray-400 text-xs italic">Empty</span>;
        }

        if (column.nodeType === 'option') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {value}
                </span>
            );
        }

        if (value.includes('<')) {
            return (
                <div
                    dangerouslySetInnerHTML={{ __html: value }}
                    className="prose prose-sm max-w-none"
                />
            );
        }

        return <span>{value}</span>;
    };

    if (loading) {
        return (
            <NodeViewWrapper className="database-node">
                <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg bg-white">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <div className="text-gray-500 text-sm">Loading database...</div>
                        {tableName && (
                            <div className="text-xs text-gray-400">{tableName}</div>
                        )}
                    </div>
                </div>
            </NodeViewWrapper>
        );
    }

    if (error) {
        return (
            <NodeViewWrapper className="database-node">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="text-red-600" size={20} />
                        <h3 className="font-semibold text-red-800">Failed to load table</h3>
                    </div>
                    <p className="text-red-600 text-sm mb-1">{error}</p>
                    {tableName && (
                        <p className="text-xs text-gray-600 mb-3">Table: {tableName}</p>
                    )}
                    <div className="text-xs text-gray-500 mb-3">
                        Table ID: {tableId}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadTableData}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                            <RefreshCw size={14} />
                            Retry
                        </button>
                        <button
                            onClick={deleteNode}
                            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </NodeViewWrapper>
        );
    }

    if (!tableData) {
        return (
            <NodeViewWrapper className="database-node">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-gray-600">No table data available</p>
                    <div className="text-xs text-gray-500 mt-1">Table ID: {tableId}</div>
                </div>
            </NodeViewWrapper>
        );
    }

    const columns = parseColumns(tableData.has_column);
    const maxRows = getMaxRows(columns);
    const rows = Array.from({ length: maxRows }, (_, i) => i + 1);

    return (
        <NodeViewWrapper className="database-node">
            <div
                className={`w-full border rounded-lg overflow-hidden shadow-sm bg-white ${selected ? 'ring-2 ring-blue-500' : 'border-gray-200'
                    }`}
            >
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <h3 className="font-semibold text-gray-900">{tableData.name}</h3>
                        <span className="text-xs text-gray-500">
                            {rows.length} {rows.length === 1 ? 'row' : 'rows'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadTableData}
                            className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-600"
                            title="Refresh"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-600">
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                {!collapsed && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="w-12 px-3 py-2 text-left text-xs font-medium text-gray-500">
                                        #
                                    </th>
                                    {columns.map(col => (
                                        <th
                                            key={col._id}
                                            className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-l border-gray-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{col.name}</span>
                                                {col.nodeType === 'option' && (
                                                    <span className="text-xs text-gray-400 font-normal">
                                                        (Option)
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(rowIndex => (
                                    <tr
                                        key={rowIndex}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-3 py-2 text-xs text-gray-500 font-medium">
                                            {rowIndex}
                                        </td>
                                        {columns.map(col => {
                                            const value = getCellValue(col, rowIndex);

                                            return (
                                                <td
                                                    key={col._id}
                                                    className="px-3 py-2 border-l border-gray-100 text-sm"
                                                >
                                                    {renderCellContent(col, value)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {!collapsed && (
                    <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 flex items-center justify-between">
                        <button className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1">
                            <Plus size={14} />
                            Add row
                        </button>
                        <div className="flex items-center gap-2">
                            {elementId && (
                                <div className="text-xs text-gray-500">
                                    Element: {elementId}
                                </div>
                            )}
                            <div className="text-xs text-gray-500">ID: {tableData.id}</div>
                        </div>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};