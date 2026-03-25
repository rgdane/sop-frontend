"use client";
import { useEffect, useState } from "react";
import { useLevelActions } from "../hook/useLevel";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import type { Level } from "@/types/data/level.types";
import { TableBuilderProps } from "@/types/props/table.types";
import { getSorterInfo } from "@/lib/tableHelper";

export default function LevelList() {
  const {
    fetchLevels,
    createLevel,
    deleteLevel,
    updateLevel,
    bulkCreateLevels,
    bulkUpdateLevels,
    bulkDeleteLevels,
  } = useLevelActions();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryParam, setQueryParam] = useState<Record<string, any>>({});

  const loadDatas = async () => {
    setLoading(true);
    try {
      const data = await fetchLevels(queryParam);
      setLevels(data);
    } catch (error) {
      console.error("Failed to load levels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatas();
  }, [queryParam]);

  const handleCreate = async (data: Omit<Level, "id">) => {
    await createLevel(data);
    await loadDatas();
  };

  const handleUpdate = async (id: number, data: Partial<Level>) => {
    await updateLevel(id, data);
    await loadDatas();
  };

  const handleDelete = async (id: number) => {
    await deleteLevel(id);
    await loadDatas();
  };

  const handleBulkCreate = async (data: Omit<Level, "id">[]) => {
    await bulkCreateLevels(data);
    await loadDatas();
  };

  const handleBulkUpdate = async (ids: number[], data: Partial<Level>) => {
    await bulkUpdateLevels(ids, data);
    await loadDatas();
  };

  const handleBulkDelete = async (ids: number[]) => {
    await bulkDeleteLevels(ids);
    await loadDatas();
  };

  const handleFilterDeleted = async (isDeleted: boolean) => {
    setQueryParam((prev) => ({ ...prev, show_deleted: isDeleted }));
  };

  const handleRestore = async (ids: number[], deletedData: Partial<Level>) => {
    await bulkUpdateLevels(ids, { deleted_at: null });
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

  const columns: TableBuilderProps<Level>["columns"] = [
    {
      key: "code",
      title: "Kode",
      dataIndex: "code",
      renderDataView: true,
      sorter: true,
      renderCell: (value: string | null | undefined) => (value ? value : "-"),
    },
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      editable: true,
      placeholder: "Masukkan nama level",
      sorter: true,
      rules: [{ required: true, message: "Nama level harus diisi" }],
    },
  ];

  return (
    <>
      <TableBuilder<Level>
        datas={levels}
        columns={columns}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onBulkCreate={handleBulkCreate}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        filterDeleted={handleFilterDeleted}
        onRestore={handleRestore}
        loading={loading}
        addButtonText="Tambah Level"
        deleteConfirmTitle="Hapus level ini?"
        onChange={(pagination, filters, sorter) => {
          const sort = getSorterInfo(sorter);
          handleSort(sort);
        }}
      />
    </>
  );
}
