"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import { useSopActions } from "../hook/useSop";
import { Sop } from "@/types/data/sop.types";
import { CustomPagination, TableBuilderProps } from "@/types/props/table.types";
import { MODULES } from "@/constants/modules";
import ColumnSearch from "@/components/ui/Table/ColumnSearch";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";
import { useDivisionActions } from "@/features/division/hook/useDivision";
import { useUrlFilter } from "@/hooks/useUrlFilter";
import { renderTag } from "@/components/ui/Tag";

export default function SopList() {
  const router = useRouter();
  const {
    fetchSops,
    createSop,
    deleteSop,
    updateSop,
    bulkDeleteSops,
    bulkCreateSops,
    bulkUpdateSops,
  } = useSopActions();
  const { divisions: divisionsData } = useDivisionActions();

  const [sop, setSop] = useState<Sop[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const {
    filter: queryParam,
    setUrlFilter: setQueryParam,
    resetUrlFilter,
  } = useUrlFilter();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { hasViewOwnOnly } = useFilterRBAC();
  const redirectPage = hasViewOwnOnly()
    ? "/dashboard/master/sop-view"
    : "/dashboard/master/sop";

  const _PAGESIZE = 20;
  const loadSops = async (cursor = 0) => {
    setLoading(true);
    try {
      let param: any = { preload: true, limit: _PAGESIZE, ...queryParam };
      if (cursor > 0) param.cursor = cursor;
      const { data, total } = await fetchSops(param);
      setSop(data);
      setTotal(total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  const loadDatas = async (cursor = 0) => {
    setLoading(true);
    try {
      const [{ data, total }] = await Promise.all([
        fetchSops({ preload: true, cursor, limit: _PAGESIZE, ...queryParam }),
      ]);
      setSop(data);
      setTotal(total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleCreate = async (data: Omit<Sop, "id"> & { title?: number[] }) => {
    const created = await createSop(data);
    if (created && (created as any).id) {
      router.push(`/dashboard/master/sop/${(created as any).id}`);
      return;
    }
    setTimeout(() => loadDatas(currentIndex), 50);
  };

  const handleUpdate = async (
    id: number,
    data: Partial<Sop> & { title?: number[] }
  ) => {
    await updateSop(id, data);
    setTimeout(() => loadSops(currentIndex), 50);
  };

  const handleDelete = async (id: number, isPermanent?: boolean) => {
    await deleteSop(id, isPermanent);
    await loadSops(currentIndex);
  };

  const handleBulkCreate = async (data: Omit<Sop, "id">[]) => {
    await bulkCreateSops({ data });
    await loadSops(currentIndex);
  };

  const handleBulkDelete = async (ids: number[], isPermanent?: boolean) => {
    await bulkDeleteSops(ids, isPermanent);
    await loadSops(currentIndex);
  };

  const handleFilterDeleted = async (isDeleted: boolean) => {
    setQueryParam({ show_deleted: isDeleted });
    setCurrentPage(1);
    setCurrentIndex(0);
    loadSops(0);
  };

  const handleRestore = async (ids: number[], deletedData: Partial<Sop>) => {
    await bulkUpdateSops(ids, { deleted_at: null });
    await loadSops(currentIndex);
  };

  // --- Pagination ---
  const handlePaginate: CustomPagination = {
    currentPage,
    totalPage: Math.ceil(total / _PAGESIZE),
    sizePage: _PAGESIZE,
    onLoadData: (page: number, index: number) => {
      setCurrentPage(page);
      setCurrentIndex(index);
      loadSops(index);
    },
  };

  const divisionOptions = divisionsData.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const columns: TableBuilderProps<Sop>["columns"] = [
    {
      key: "code",
      title: "Kode",
      dataIndex: "code",
      editable: false,
      renderDataView: true,
      placeholder: "Masukkan kode SOP",
      renderCell: (value: string) => value || "-",
      ...ColumnSearch("Cari kode", {
        defaultFilterValue: queryParam?.code,
        onSearch: (value) => {
          setQueryParam({ code: value });
          return false;
        },
        onReset: () => {
          resetUrlFilter()
          setQueryParam({ code: "" });
          return false;
        },
      }),
    },
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      editable: true,
      placeholder: "Masukkan nama sop",
      rules: [{ required: true, message: "Nama sop wajib diisi." }],
      ...ColumnSearch("Cari nama", {
        defaultFilterValue: queryParam?.name,
        onSearch: (value) => {
          setQueryParam({ name: value });
          return false;
        },
        onReset: () => {
          resetUrlFilter()
          setQueryParam({ name: "" });
          return false;
        },
      }),
    },
    {
      key: "has_divisions",
      title: "Divisi",
      dataIndex: "has_divisions",
      editable: true,
      inputType: "multiSelect" as const,
      placeholder: "Pilih divisi",
      options: divisionOptions,
      rules: [{ required: true, message: "Divisi wajib diisi" }],
      renderCell: (value: any) => value.map((d: any) => renderTag(d.name)) || "-",
      ...ColumnSearch("Cari divisi", {
        mode: "options",
        selectOptions: divisionOptions,
        defaultFilterValue: queryParam?.division_id,
        onSearch: (value) => {
          setQueryParam({ division_id: value });
          return false;
        },
        onReset: () => {
          resetUrlFilter();
          setQueryParam({ division_id: "" });
          return false;
        },
      }),
    },
  ];

  useEffect(() => {
    loadDatas();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setCurrentIndex(0);
    loadSops(0);
  }, [queryParam]);

  return (
    <TableBuilder<Sop>
      title="Manajemen SOP"
      description="Kelola data sop"
      redirectPage={redirectPage}
      redirectModule={MODULES._SOP}
      datas={sop || []}
      columns={columns}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onBulkCreate={handleBulkCreate}
      onBulkDelete={handleBulkDelete}
      filterDeleted={handleFilterDeleted}
      onRestore={handleRestore}
      loading={loading}
      addButtonText="Add SOP"
      deleteConfirmTitle="Hapus SOP ini?"
      useModal={true}
      onPaginate={handlePaginate}
      currentPage={currentPage}
      pageSize={_PAGESIZE}
      useFooterAction={true}
      useTrashFilter={true}
    />
  );
}
