"use client";
import { useTitleActions } from "../hook/useTitle";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import type { Title } from "@/types/data/title.types";
import { CustomColumnProps } from "@/types/props/column.types";
import { renderTag } from "@/components/ui/Tag";
import { getSorterInfo } from "@/lib/tableHelper";

export default function TitleList() {
  const {
    titles,
    isLoadingTitles,
    setTitleParams,
    createTitle,
    updateTitle,
    deleteTitle,
    bulkCreateTitles,
    bulkUpdateTitles,
    bulkDeleteTitles,
  } = useTitleActions();

  const handleSort = (sorter: any) => {
    setTitleParams((prev) => ({
      ...prev,
      sort: sorter[0]?.column,
      order: sorter[0]?.order,
    }));
  };

  const handleCreate = async (data: Omit<Title, "id">) => {
    createTitle(data);
  };

  const handleUpdate = async (id: number, data: Partial<Title>) => {
    updateTitle(id, data);
  };

  const handleDelete = async (id: number) => {
    deleteTitle(id);
  };

  const handleBulkCreate = async (data: Omit<Title, "id">[]) => {
    bulkCreateTitles(data);
  };

  const handleBulkUpdate = async (ids: number[], data: Partial<Title>) => {
    bulkUpdateTitles(ids, data);
  };

  const handleBulkDelete = async (ids: number[]) => {
    bulkDeleteTitles(ids);
  };

  const handleFilterDeleted = async (isDeleted: boolean) => {
    setTitleParams((prev) => ({ ...prev, show_deleted: isDeleted }));
  };

  const handleRestore = async (ids: number[], deletedData: Partial<Title>) => {
    bulkUpdateTitles(ids, { deleted_at: null });
  };

  const titleColumns: CustomColumnProps<Title>[] = [
    {
      key: "code",
      title: "Kode",
      dataIndex: "code",
      editable: true,
      placeholder: "Masukkan kode jabatan",
      rules: [{ required: true, message: "Kode jabatan harus diisi" }],
      renderCell: (_: string, record: Title) => renderTag(record.name, record.color),
      sorter: true,
    },
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      editable: true,
      placeholder: "Masukkan nama jabatan",
      rules: [{ required: true, message: "Nama jabatan harus diisi" }],
      sorter: true,
    },
    {
      key: "color",
      title: "Warna",
      dataIndex: "color",
      editable: true,
      inputType: "color",
      placeholder: "Masukkan warna status",
      renderDataView: false,
      //rules: [{ required: true, message: "Warna harus diisi" }],
    },
  ];

  return (
    <>
      <TableBuilder<Title>
        datas={titles}
        columns={titleColumns}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onBulkCreate={handleBulkCreate}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        filterDeleted={handleFilterDeleted}
        onRestore={handleRestore}
        loading={isLoadingTitles}
        addButtonText="Tambah Jabatan"
        deleteConfirmTitle="Hapus jabatan ini?"
        onChange={(pagination, filters, sorter) => {
          const sort = getSorterInfo(sorter);
          handleSort(sort);
        }}
      />
    </>
  );
}
