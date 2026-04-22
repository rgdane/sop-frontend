"use client";
import { useEffect, useState } from "react";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import { CustomPagination, TableBuilderProps } from "@/types/props/table.types";
import { MODULES } from "@/constants/modules";
import { useSpkActions } from "../hook/useSpk";
import { Spk } from "@/types/data/spk.types";
import { renderTag, renderTags } from "@/components/ui/Tag";
import TableSearch from "@/components/ui/Table/ColumnSearch";
import { useTitleActions } from "@/features/title/hook/useTitle";
import { Title } from "@/types/data/title.types";
import { useUrlFilter } from "@/hooks/useUrlFilter";

export default function SpkList() {
  const {
    fetchSpks,
    createSpk,
    deleteSpk,
    updateSpk,
    bulkCreateSpks,
    bulkUpdateSpks,
    bulkDeleteSpks,
  } = useSpkActions();
  const { titles } = useTitleActions();
  const [spk, setSpk] = useState<Spk[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    filter: queryParam,
    setUrlFilter: setQueryParam,
    resetUrlFilter,
  } = useUrlFilter();

  const _PAGESIZE = 20;

  const loadSpks = async (offset = 0, customQuery?: Record<string, any>) => {
    setLoading(true);

    const param: any = {
      preload: true,
      limit: _PAGESIZE,
      ...queryParam,
      ...(customQuery || {}),
    };

    if (offset > 0) param.offset = offset;

    try {
      const { data, total } = await fetchSpks(param);
      setSpk(data);
      setTotal(total ?? 0);
    } catch (error) {
      console.error("Failed to load SPKs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginate: CustomPagination = {
    currentPage,
    totalPage: Math.ceil(total / _PAGESIZE),
    sizePage: _PAGESIZE,
    onLoadData: (page: number, index: number) => {
      setCurrentPage(page);
      setCurrentIndex(index);
      loadSpks(index);
    },
  };

  const loadDatas = async (query?: Record<string, any>) => {
    setLoading(true);

    const param: any = { preload: true, limit: _PAGESIZE };
    if (query) Object.assign(param, query);

    try {
      const [{ data, total }] = await Promise.all([
        fetchSpks(param),
      ]);
      setSpk(data);
      setTotal(total ?? 0);
    } catch (error) {
      console.error("Failed to load datas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<Spk, "id"> & { title?: number[] }) => {
    await createSpk(data);
    setTimeout(async () => {
      await loadSpks(currentPage === 1 ? 0 : (currentPage - 1) * _PAGESIZE);
    }, 50);
  };

  const handleUpdate = async (
    id: number,
    data: Partial<Spk> & { title?: number[] }
  ) => {
    await updateSpk(id, data);
    await loadSpks(currentIndex);
  };

  const handleDelete = async (id: number) => {
    await deleteSpk(id);
    await loadSpks(currentIndex);
  };

  const handleBulkCreate = async (data: Omit<Spk, "id">[]) => {
    await bulkCreateSpks({ data });
    await loadSpks(currentIndex);
  };

  const handleBulkUpdate = async (ids: number[], data: Partial<Spk>) => {
    await bulkUpdateSpks(ids, data);
    await loadSpks(currentIndex);
  };

  const handleBulkDelete = async (ids: number[]) => {
    await bulkDeleteSpks(ids);
    await loadSpks(currentIndex);
  };

  const handleFilterDeleted = async (isDeleted: boolean) => {
    setQueryParam({ show_deleted: isDeleted });
  };

  const handleRestore = async (ids: number[], deletedData: Partial<Spk>) => {
    await bulkUpdateSpks(ids, { deleted_at: null });
    await loadSpks(currentIndex);
  };

  useEffect(() => {
    loadDatas();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setCurrentIndex(0);
    loadSpks(0);
  }, [queryParam]);

  const titleOptions = titles.map((title) => ({
    label: title.name,
    value: title.id,
  }));

  const filterTitleOpt =
    spk.length > 0
      ? Array.from(
        new Set(
          spk
            .flatMap((u) => u.has_titles?.map((r: any) => r.name) ?? [])
            .filter(Boolean)
        )
      ).map((role) => ({
        text: role,
        value: role,
      }))
      : [];

  const columns: TableBuilderProps<Spk>["columns"] = [
    {
      key: "code",
      title: "Kode",
      dataIndex: "code",
      editable: true,
      inputType: "text",
      renderDataView: true,
      placeholder: "Masukkan kode SPK",
      rules: [{ required: true, message: "Kode SPK wajib diisi." }],
      renderCell: (value: string) => renderTag(value),
    },
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      editable: true,
      inputType: "text",
      renderDataView: true,
      placeholder: "Masukkan nama spk",
      rules: [{ required: true, message: "Nama spk wajib diisi." }],
      ...TableSearch("Cari nama", {
        onSearch: (value: any) => {
          setQueryParam({ name: value });
          return false;
        },
        onReset: () => {
          resetUrlFilter();
          return false;
        },
      }),
    },
    {
      key: "has_title",
      title: "Kepemilikan SPK",
      dataIndex: "has_title",
      editable: true,
      inputType: "multiSelect" as const,
      placeholder: "Pilih jabatan",
      options: titleOptions,
      filterSearch: true,
      filters: filterTitleOpt,
      onFilter: (value, record) => {
        const spkTitle = record.has_titles?.map((r: any) => r.name) ?? [];
        return spkTitle.includes(value);
      },
      rules: [{ required: false, message: "Jabatan wajib diisi" }],
      renderCell: (_: unknown, record: any) => {
        return renderTags(record.has_titles, "code");
      },
    },
    {
      key: "deleted_at",
      title: "Deleted At",
      dataIndex: "deleted_at",
      editable: false,
      inputType: "text",
      renderDataView: false,
    },
  ];

  return (
    <TableBuilder<Spk>
      title="Manajemen SPK"
      description="Kelola data SPK"
      redirectPage={`/dashboard/master/spk/`}
      datas={spk}
      columns={columns}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      filterDeleted={handleFilterDeleted}
      onRestore={handleRestore}
      onBulkCreate={handleBulkCreate}
      onBulkUpdate={handleBulkUpdate}
      onBulkDelete={handleBulkDelete}
      loading={loading}
      addButtonText="Add SPK"
      deleteConfirmTitle="Hapus SPK ini?"
      useModal={true}
      onPaginate={handlePaginate}
      currentPage={currentPage}
      pageSize={_PAGESIZE}
    />
  );
}
