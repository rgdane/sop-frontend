// "use client";

// import { useRef, useState } from "react";
// import { Table } from "antd";
// import {
//   BaseRecord,
//   EditableRecord,
//   TableBuilderProps,
// } from "@/types/props/table.types";
// import { HeaderAction } from "@/components/ui/Table/HeaderAction";
// import { BulkActionBar } from "@/components/ui/Table/BulkActionBar";
// import { FooterAction } from "@/components/ui/Table/FooterAction";
// import { useIsMobile } from "@/app/dashboard/layout";
// import { useTableActions } from "@/hooks/table/useTableAction";
// import { useTableSelection } from "@/hooks/table/useTableSelection";
// import { useTableEditing } from "@/hooks/table/useTableEditing";
// import { useTableData } from "@/hooks/table/useTableData";
// import { useTableColumns } from "@/hooks/table/useTableColumns";
// import { createPasteHandler } from "@/lib/pasteHandler";

// export function TableBuilder<T extends BaseRecord>({
//   datas,
//   title,
//   description,
//   columns,
//   currentPage,
//   pageSize,
//   onChange,
//   onCreate = async (data: Omit<T, "id">) => {},
//   onUpdate = async (id: number, data: Partial<T>) => {},
//   onDelete = async (id: number) => {},
//   onBulkCreate = undefined,
//   onBulkUpdate,
//   onBulkDelete,
//   onFieldChange,
//   onGenerator,
//   loading = false,
//   useModal = true,
//   useGenerator = false,
//   useDrawer = false,
//   useDelete = true,
//   useBulkAction = true,
//   useHeaderAction = true,
//   useFooterAction = true,
//   addButtonText = "Tambah",
//   addGeneratorText = "Generate",
//   deleteConfirmTitle = "Hapus Data?",
//   defaultValues,
//   hideActions,
//   redirectPage = null,
//   rowProps,
//   redirectModule = "",
//   onPaginate = undefined,
//   autoSave = false,
//   rowClickUpdate = false,
// }: TableBuilderProps<T>) {
//   const tableContainerRef = useRef<HTMLDivElement>(null);
//   const [draggingRowIndex, setDraggingRowIndex] = useState<number | null>(null);
//   const isMobile = useIsMobile();

//   // Use custom hooks
//   const { dataSource, setDataSource, tempCounter, setTempCounter } =
//     useTableData(datas, title);

//   const {
//     editingIds,
//     setEditingIds,
//     activeTempId,
//     setActiveTempId,
//     validationErrors,
//     setValidationErrors,
//     clearValidationError,
//   } = useTableEditing();

//   const {
//     selectedRowKeys,
//     setSelectedRowKeys,
//     rowSelection,
//     getSelectedRecords,
//   } = useTableSelection(dataSource, hideActions);

//   const {
//     handleRowSave,
//     handleDelete,
//     handleBulkCreateNewRows,
//     validateRecords,
//   } = useTableActions(columns, onCreate, onUpdate, onDelete, onBulkCreate);

//   // Normalize columns
//   const normalizedColumns = columns.map((col) => ({
//     ...col,
//     renderDataView: col.renderDataView ?? true,
//   }));

//   // Event handlers
//   const handleRowClick = (record: EditableRecord & T) => {
//     if (rowClickUpdate) {
//       if (!editingIds.includes(record.tempId)) {
//         setEditingIds((prev) => [...prev, record.tempId]);
//       }
//     }
//   };

//   const handleInputChange = (tempId: number, field: keyof T, value: any) => {
//     setDataSource((prev) =>
//       prev.map((row) =>
//         row.tempId === tempId ? { ...row, [field]: value } : row
//       )
//     );

//     if (autoSave) {
//       setEditingIds((prev) =>
//         prev.includes(tempId) ? prev : [...prev, tempId]
//       );
//     }

//     clearValidationError(tempId, field as string);

//     if (onFieldChange) {
//       const record = dataSource.find((row) => row.tempId === tempId);
//       if (record) {
//         onFieldChange(tempId, field, value, record);
//       }
//     }
//   };

//   const handleAddRow = () => {
//     const newTempId = tempCounter;
//     const newRecord = {
//       id: 0,
//       isNew: true,
//       tempId: newTempId,
//       ...defaultValues,
//     } as EditableRecord & T;

//     setDataSource((prev) => [...prev, newRecord]);
//     setActiveTempId(newTempId);
//     setTempCounter((prev) => prev + 1);
//     setEditingIds((prev) => [...prev, newTempId]);

//     // Auto-scroll and focus
//     setTimeout(() => {
//       if (tableContainerRef.current) {
//         const tableBody =
//           tableContainerRef.current.querySelector(".ant-table-tbody");
//         if (tableBody) {
//           tableBody.scrollTop = tableBody.scrollHeight;
//         }

//         const lastRow = tableContainerRef.current.querySelector(
//           ".ant-table-tbody tr:last-child"
//         );
//         if (lastRow) {
//           lastRow.scrollIntoView({
//             behavior: "smooth",
//             block: "nearest",
//           });
//         }

//         const lastInput = tableContainerRef.current.querySelector(
//           ".ant-table-tbody tr:last-child input, .ant-table-tbody tr:last-child .ant-select-selector"
//         );
//         if (lastInput) {
//           (lastInput as HTMLElement).focus();
//         }
//       }
//     }, 100);
//   };

//   const handleCreateModalSubmit = async (values: Omit<T, "id">) => {
//     try {
//       await onCreate(values);
//     } catch (error) {
//       console.error("Create error:", error);
//     }
//   };

//   const handleSaveLogic = async (updatedRecord?: EditableRecord & T) => {
//     const allNewRecords = dataSource.filter((d) => d.isNew);
//     if (allNewRecords.length > 0) {
//       await handleBulkCreateNewRows(
//         dataSource,
//         setEditingIds,
//         setDataSource,
//         setValidationErrors
//       );
//       return;
//     }

//     let recordsToSave;
//     if (updatedRecord && !updatedRecord.isNew) {
//       recordsToSave = [updatedRecord];
//     } else {
//       recordsToSave = dataSource.filter(
//         (d) => !d.isNew && editingIds.includes(d.tempId)
//       );
//     }

//     if (recordsToSave.length === 0) return;

//     const newValidationErrors = validateRecords(recordsToSave);

//     if (Object.keys(newValidationErrors).length > 0) {
//       setValidationErrors(newValidationErrors);
//       return;
//     }

//     setValidationErrors({});

//     await Promise.all(recordsToSave.map((r) => handleRowSave(r, true)));
//   };

//   // Bulk operations
//   const handleBulkDelete = () => {
//     setDataSource((prev) =>
//       prev.filter((item) => !selectedRowKeys.includes(item.tempId))
//     );
//     setEditingIds((prev) => prev.filter((id) => !selectedRowKeys.includes(id)));
//     setSelectedRowKeys([]);
//   };

//   const handleBulkUpdate = async (updateData: Partial<T>) => {
//     if (onBulkUpdate) {
//       const realIds = selectedRowKeys
//         .map((key) => {
//           const record = dataSource.find((r) => r.tempId === key);
//           return record && !record.isNew ? record.id : null;
//         })
//         .filter((id): id is number => id !== null);

//       if (realIds.length > 0) {
//         await onBulkUpdate(realIds, updateData);
//       }
//     }
//   };

//   const handleBulkDeleteConfirm = async () => {
//     if (onBulkDelete) {
//       const realIds = selectedRowKeys
//         .map((key) => {
//           const record = dataSource.find((r) => r.tempId === key);
//           return record && !record.isNew ? record.id : null;
//         })
//         .filter((id): id is number => id !== null);

//       if (realIds.length > 0) {
//         await onBulkDelete(realIds);
//       }
//     }

//     setDataSource((prev) =>
//       prev.filter((item) => !selectedRowKeys.includes(item.tempId))
//     );
//     setEditingIds((prev) => prev.filter((id) => !selectedRowKeys.includes(id)));
//   };

//   // Paste handler
//   const handlePaste = createPasteHandler(
//     columns,
//     setDataSource,
//     tempCounter,
//     setTempCounter,
//     editingIds,
//     setEditingIds,
//     activeTempId
//   );

//   const getEnhancedRowProps = (record: EditableRecord & T, index?: number) => {
//     const recordIndex = index ?? 0;
//     const baseProps = rowProps ? rowProps(record, recordIndex) : {};
//     return {
//       ...baseProps,
//     };
//   };

//   // Generate table columns
//   const tableColumns = useTableColumns(
//     normalizedColumns,
//     editingIds,
//     validationErrors,
//     columns,
//     hideActions,
//     draggingRowIndex,
//     isMobile,
//     onPaginate,
//     handleInputChange,
//     setActiveTempId,
//     handleSaveLogic,
//     autoSave,
//     redirectModule,
//     useDelete,
//     useModal,
//     useDrawer,
//     deleteConfirmTitle,
//     setEditingIds,
//     setDataSource,
//     (record) => handleDelete(record, setDataSource, setEditingIds),
//     onUpdate,
//     redirectPage,
//     onBulkCreate,
//     () =>
//       handleBulkCreateNewRows(
//         dataSource,
//         setEditingIds,
//         setDataSource,
//         setValidationErrors
//       )
//   );

//   return (
//     <div className="flex flex-col gap-y-2 h-full">
//       <HeaderAction
//         columns={columns}
//         title={title}
//         description={description}
//         useHeaderAction={useHeaderAction}
//         useModal={useModal}
//         useDrawer={useDrawer}
//         useGenerator={useGenerator}
//         onGenerator={onGenerator!}
//         useBulkAction={false}
//         defaultValues={defaultValues}
//         onAdd={handleCreateModalSubmit}
//         onChange={handleInputChange}
//         onSave={async () => {
//           const newRecords = dataSource.filter(
//             (d) => d.isNew && editingIds.includes(d.tempId)
//           );
//           const existingRecords = dataSource.filter(
//             (d) => !d.isNew && editingIds.includes(d.tempId)
//           );

//           const allRecords = [...newRecords, ...existingRecords];
//           const newValidationErrors = validateRecords(allRecords);

//           if (Object.keys(newValidationErrors).length > 0) {
//             setValidationErrors(newValidationErrors);
//             return;
//           }

//           setValidationErrors({});

//           let allSuccess = true;

//           if (newRecords.length > 0) {
//             const success = await handleBulkCreateNewRows(
//               dataSource,
//               setEditingIds,
//               setDataSource,
//               setValidationErrors
//             );
//             if (!success) {
//               allSuccess = false;
//             }
//           }

//           if (existingRecords.length > 0) {
//             const results = await Promise.all(
//               existingRecords.map((r) => handleRowSave(r, true))
//             );
//             if (!results.every((res) => res)) {
//               allSuccess = false;
//             }
//           }

//           if (allSuccess && newRecords.length > 0) {
//             setDataSource((prev) => prev.filter((r) => !r.isNew));
//           }
//         }}
//         disableSave={editingIds.length === 0}
//         selectedRowKeys={selectedRowKeys}
//         onBulkDelete={handleBulkDelete}
//         addButtonText={addButtonText}
//         addGeneratorText={addGeneratorText}
//         autoSave={autoSave}
//       />

//       <div
//         className="flex-1 min-h-0"
//         ref={tableContainerRef}
//         onPaste={handlePaste}
//       >
//         <Table
//           className="h-full mb-2"
//           size="small"
//           key="stable-table"
//           {...(useBulkAction ? { rowSelection } : {})}
//           columns={tableColumns}
//           dataSource={dataSource.map((row) => {
//             if (row && typeof row === "object" && "children" in row) {
//               const clone = { ...row };
//               delete (clone as any).children;
//               return clone;
//             }
//             return row;
//           })}
//           rowKey="tempId"
//           loading={loading}
//           pagination={false}
//           scroll={{ x: "max-content", y: 550 }}
//           onRow={(record, index) => ({
//             ...getEnhancedRowProps(record, index),
//             onClick: rowClickUpdate ? () => handleRowClick(record) : undefined,
//           })}
//           onChange={(pagination, filters, sorter) =>
//             onChange?.(pagination, filters, sorter)
//           }
//         />

//         <div className="flex justify-between">
//           <FooterAction
//             onAddRow={handleAddRow}
//             useBulkAction={false}
//             selectedRowKeys={[]}
//             onBulkDelete={() => {}}
//             useFooterAction={useFooterAction}
//             addButtonText={addButtonText}
//             dataSource={dataSource}
//             onPaginate={onPaginate}
//           />
//         </div>
//       </div>

//       {useBulkAction && (
//         <BulkActionBar<T>
//           selectedCount={selectedRowKeys.length}
//           selectedRowKeys={selectedRowKeys}
//           selectedRecords={getSelectedRecords()}
//           allRecords={dataSource}
//           columns={columns}
//           onBulkUpdate={onBulkUpdate ? handleBulkUpdate : undefined}
//           onBulkDelete={handleBulkDeleteConfirm}
//           useDelete={useDelete}
//           onClear={() => setSelectedRowKeys([])}
//           onSelectAll={() =>
//             setSelectedRowKeys(dataSource.map((d) => d.tempId))
//           }
//           onSelectRows={(rowKeys) => setSelectedRowKeys(rowKeys)}
//           totalCount={dataSource.length}
//         />
//       )}
//     </div>
//   );
// }
