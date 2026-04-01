"use client";
import { useEffect, useState } from "react";
import { useDivisionActions } from "../hook/useDivisionSql";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import type { Division } from "@/types/data/division.types";
import type { Department } from "@/types/data/department.types";
import { useDepartmentActions } from "@/features/department/hook/useDepartment";
import { getSorterInfo } from "@/lib/tableHelper";
import { getOptions, getOptionsById } from "@/lib/getOption";
import { renderTag } from "@/components/ui/Tag";

export default function DivisionList() {
  const {
    divisions,
    isLoadingDivisions,
    setDivisionParams,
    createDivision,
    updateDivision,
    deleteDivision,
    bulkCreateDivisions,
    bulkUpdateDivisions,
    bulkDeleteDivisions,
  } = useDivisionActions();
  const { fetchDepartments } = useDepartmentActions();
  const [departments, setDepartments] = useState<Department[]>([]);

  const loadDepartments = async () => {
    try {
      const departmentsRes = await fetchDepartments();
      setDepartments(departmentsRes);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreate = async (data: Omit<Division, "id">) => {
    createDivision(data);
  };

  const handleUpdate = async (id: number, data: Partial<Division>) => {
    updateDivision(id, data);
  };

  const handleDelete = async (id: number) => {
    deleteDivision(id);
  };

  const handleBulkCreate = async (data: Omit<Division, "id">[]) => {
    bulkCreateDivisions(data);
  };

  const handleBulkUpdate = async (ids: number[], data: Partial<Division>) => {
    bulkUpdateDivisions(ids, data);
  };

  const handleBulkDelete = async (ids: number[]) => {
    bulkDeleteDivisions(ids);
  };

  const handleFilterDeleted = async (isDeleted: boolean) => {
    setDivisionParams((prev) => ({ ...prev, show_deleted: isDeleted }));
  }

  const handleRestore = async (ids: number[], deletedData: Partial<Division>) => {
    bulkUpdateDivisions(ids, { deleted_at: null });
  }

  const handleSort = (sorter: any) => {
    setDivisionParams((prev) => ({
      ...prev,
      sort: sorter[0]?.column,
      order: sorter[0]?.order,
    }));
  };

  const divisionColumns = [
    {
      key: "code",
      title: "Kode",
      dataIndex: "code",
      editable: true,
      placeholder: "Masukkan kode departemen",
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
      placeholder: "Masukkan nama posisi",
      rules: [{ required: true, message: "Nama wajib diisi" }],
      sorter: true,
    },
    {
      key: "department_id",
      title: "Departemen",
      dataIndex: "department_id",
      editable: true,
      inputType: "select" as const,
      placeholder: "Pilih departemen",
      options: getOptions(departments),
      rules: [{ required: true, message: "Departemen wajib diisi" }],
      renderCell: (value: number) =>
        getOptionsById(value, departments) || "---",
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
        loading={isLoadingDivisions}
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
