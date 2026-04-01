"use client";
import { useEffect, useState } from "react";
import { useDivisionActions } from "../hook/useDivisionSql";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import type { Division } from "@/types/data/division.types";
import { getSorterInfo } from "@/lib/tableHelper";
import { renderTag } from "@/components/ui/Tag";

export default function DivisionList() {
  const {
      fetchDivisions,
      createDivision,
      deleteDivision,
      updateDivision,
      bulkCreateDivisions,
      bulkUpdateDivisions,
      bulkDeleteDivisions,
    } = useDivisionActions();
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(false);
    const [queryParam, setQueryParam] = useState<Record<string, any>>({});
  
    const loadDatas = async () => {
      setLoading(true);
      try {
        const data = await fetchDivisions(queryParam);
        setDivisions(data);
      } catch (error) {
        console.error("Failed to load divisions:", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      loadDatas();
    }, [queryParam]);
  
    const handleCreate = async (data: Omit<Division, "id">) => {
      await createDivision(data);
      await loadDatas();
    };
  
    const handleUpdate = async (id: number, data: Partial<Division>) => {
      await updateDivision(id, data);
      await loadDatas();
    };
  
    const handleDelete = async (id: number) => {
      await deleteDivision(id);
      await loadDatas();
    };
  
    const handleBulkCreate = async (data: Omit<Division, "id">[]) => {
      await bulkCreateDivisions(data);
      await loadDatas();
    };
  
    const handleBulkUpdate = async (ids: number[], data: Partial<Division>) => {
      await bulkUpdateDivisions(ids, data);
      await loadDatas();
    };
  
    const handleBulkDelete = async (ids: number[]) => {
      await bulkDeleteDivisions(ids);
      await loadDatas();
    };
  
    const handleFilterDeleted = async (isDeleted: boolean) => {
      setQueryParam((prev) => ({ ...prev, show_deleted: isDeleted }));
    };
  
    const handleRestore = async (ids: number[], deletedData: Partial<Division>) => {
      await bulkUpdateDivisions(ids, { deleted_at: null });
      await loadDatas();
    };
  
    const handleSort = async (sorter: any) => {
      setQueryParam((prev) => {
        return {
          ...prev,
          sort: sorter[0]?.column,
          order: sorter[0]?.order,
        };
      });
    };

  const divisionColumns = [
    {
      key: "code",
      title: "Kode",
      dataIndex: "code",
      editable: true,
      placeholder: "Masukkan kode divisi",
      sorter: true,
      rules: [{ required: true, message: "Kode wajib diisi" }],
      renderCell(value: string) {
        return value ? renderTag(value) : "-";
      },
    },
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      editable: true,
      placeholder: "Masukkan nama divisi",
      rules: [{ required: true, message: "Nama wajib diisi" }],
      sorter: true,
    },
  ];

  return (
    <>
      <TableBuilder<Division>
        datas={divisions}
        columns={divisionColumns}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onBulkCreate={handleBulkCreate}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        filterDeleted={handleFilterDeleted}
        onRestore={handleRestore}
        loading={loading}
        addButtonText="Tambah Divisi"
        deleteConfirmTitle="Hapus divisi ini?"
        onChange={(pagination, filters, sorter) => {
          const sort = getSorterInfo(sorter);
          handleSort(sort);
        }}
      />
    </>
  );
}
