"use client";
import { useEffect, useState } from "react";
import { usePositionActions } from "../hook/usePosition";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import type { Position } from "@/types/data/position.types";
import type { Division } from "@/types/data/division.types";
import { useDivisionActions } from "@/features/division/hook/useDivision";
import { getSorterInfo } from "@/lib/tableHelper";
import { getOptions, getOptionsById } from "@/lib/getOption";
import { TableBuilderProps } from "@/types/props/table.types";
import { renderTag } from "@/components/ui/Tag";

export default function PositionList() {
  const {
    fetchPositions,
    createPosition,
    deletePosition,
    updatePosition,
    bulkCreatePositions,
    bulkUpdatePositions,
    bulkDeletePositions,
  } = usePositionActions();
  const { divisions: divisionsData } = useDivisionActions();
  const [positions, setPositions] = useState<Position[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryParam, setQueryParam] = useState<Record<string, any>>({});

  const loadDatas = async () => {
    setLoading(true);
    try {
      const [positionsData] = await Promise.all([
        fetchPositions(queryParam),
      ]);

      setPositions(positionsData);
      setDivisions(divisionsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatas();
  }, [queryParam]);

  const handleCreate = async (data: Omit<Position, "id">) => {
    await createPosition(data);
    await loadDatas();
  };

  const handleUpdate = async (id: number, data: Partial<Position>) => {
    await updatePosition(id, data);
    await loadDatas();
  };

  const handleDelete = async (id: number) => {
    await deletePosition(id);
    await loadDatas();
  };

  const handleBulkCreate = async (data: Omit<Position, "id">[]) => {
    await bulkCreatePositions(data);
    await loadDatas();
  };

  const handleBulkUpdate = async (ids: number[], data: Partial<Position>) => {
    await bulkUpdatePositions(ids, data);
    await loadDatas();
  };

  const handleBulkDelete = async (ids: number[]) => {
    await bulkDeletePositions(ids);
    await loadDatas();
  };

  const handleFilterDeleted = async (isDeleted: boolean) => {
    setQueryParam((prev) => ({ ...prev, show_deleted: isDeleted }));
  };

  const handleRestore = async (ids: number[], deletedData: Partial<Position>) => {
    await bulkUpdatePositions(ids, { deleted_at: null });
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

  const positionColumns: TableBuilderProps<Position>["columns"] = [
    {
      key: "code",
      title: "Kode",
      dataIndex: "code",
      sorter: true,
      renderCell: (_: string, record: Position) =>
        renderTag(record.code, record.color)
    },
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      editable: true,
      placeholder: "Masukkan nama posisi",
      rules: [{ required: true, message: "Nama wajib diisi" }],
      sorter: true,
    },
    {
      key: "division_id",
      title: "Divisi",
      dataIndex: "division_id",
      editable: true,
      inputType: "select" as const,
      placeholder: "Pilih divisi",
      options: getOptions(divisions),
      rules: [{ required: true, message: "Divisi wajib diisi" }],
      renderCell: (id: number) => getOptionsById(id, divisions) || "---",
    },
    {
      key: "color",
      title: "Warna",
      dataIndex: "color",
      editable: true,
      inputType: "color",
      placeholder: "Masukkan warna status",
      renderDataView: false,
      rules: [{ required: true, message: "Warna harus diisi" }],
    },
  ];

  return (
    <>
      <TableBuilder<Position>
        datas={positions}
        columns={positionColumns}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onBulkCreate={handleBulkCreate}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        filterDeleted={handleFilterDeleted}
        onRestore={handleRestore}
        loading={loading}
        addButtonText="Tambah Posisi"
        deleteConfirmTitle="Hapus posisi ini?"
        onChange={(pagination, filters, sorter) => {
          const sort = getSorterInfo(sorter);
          handleSort(sort);
        }}
      />
    </>
  );
}
