"use client";
import { useEffect, useState } from "react";
import { useDepartmentActions } from "../hook/useDepartment";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import { CustomColumnProps } from "@/types/props/column.types";
import { renderTag } from "@/components/ui/Tag";
import { Department } from "@/types/data/department.types";
import { getSorterInfo } from "@/lib/tableHelper";

export default function DepartmentList() {
  const {
    fetchDepartments,
    createDepartment,
    deleteDepartment,
    updateDepartment,
    bulkCreateDepartments,
    bulkUpdateDepartments,
    bulkDeleteDepartments,
  } = useDepartmentActions();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryParam, setQueryParam] = useState<Record<string, any>>({});

  const loadDatas = async () => {
    setLoading(true);
    try {
      const data = await fetchDepartments(queryParam);
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatas();
  }, [queryParam]);

  const handleCreate = async (data: Omit<Department, "id">) => {
    await createDepartment(data);
    await loadDatas();
  };

  const handleUpdate = async (id: number, data: Partial<Department>) => {
    await updateDepartment(id, data);
    await loadDatas();
  };

  const handleDelete = async (id: number) => {
    await deleteDepartment(id);
    await loadDatas();
  };

  const handleBulkCreate = async (data: Omit<Department, "id">[]) => {
    await bulkCreateDepartments(data);
    await loadDatas();
  };

  const handleBulkUpdate = async (ids: number[], data: Partial<Department>) => {
    await bulkUpdateDepartments(ids, data);
    await loadDatas();
  };

  const handleBulkDelete = async (ids: number[]) => {
    await bulkDeleteDepartments(ids);
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

  const handleFilterDeleted = async (isDeleted: boolean) => {
    setQueryParam((prev) => ({ ...prev, show_deleted: isDeleted }));
  };

  const handleRestore = async (ids: number[], deletedData: Partial<Department>) => {
    await bulkUpdateDepartments(ids, { deleted_at: null });
    await loadDatas();
  };

  const departmentColumns: CustomColumnProps<Department>[] = [
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      editable: true,
      placeholder: "Masukkan nama departemen",
      rules: [{ required: true, message: "Nama wajib diisi" }],
      sorter: true,
    },
    {
      key: "code",
      title: "Kode",
      dataIndex: "code",
      editable: true,
      placeholder: "Masukkan kode departemen",
      sorter: true,
      rules: [{ required: true, message: "Kode wajib diisi" }],
      renderCell(value, record) {
        return value;
      },
    },
  ];

  return (
    <>
      <TableBuilder<Department>
        datas={departments}
        columns={departmentColumns}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onBulkCreate={handleBulkCreate}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        filterDeleted={handleFilterDeleted}
        onRestore={handleRestore}
        loading={loading}
        addButtonText="Tambah Departemen"
        deleteConfirmTitle="Hapus departemen ini?"
        onChange={(pagination, filters, sorter) => {
          const sort = getSorterInfo(sorter);
          handleSort(sort);
        }}
      />
    </>
  );
}
