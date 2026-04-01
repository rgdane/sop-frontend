"use client";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import ColumnSearch from "@/components/ui/Table/ColumnSearch";
import { renderTag } from "@/components/ui/Tag";
import { MODULES } from "@/constants/modules";
import { useDivisionActions } from "@/features/division/hook/useDivision";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";
import { useUrlFilter } from "@/hooks/useUrlFilter";
import { Sop } from "@/types/data/sop.types";
import { CustomPagination, TableBuilderProps } from "@/types/props/table.types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSopActions } from "../hook/useSop";

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
  const { fetchDivisions } = useDivisionActions();

  const [sop, setSop] = useState<Sop[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [divisionsData, setDivisionsData] = useState<any[]>([]);

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
      // Panggil fetchSops dan fetchDivisions secara bersamaan menggunakan Promise.all
      const [sopRes, divisionRes] = await Promise.all([
        fetchSops({ preload: true, cursor, limit: _PAGESIZE, ...queryParam }),
        // Memanggil fetchDivisions tanpa pagination/limit khusus agar semua divisi terambil (opsional bisa ditambah limit besar)
        fetchDivisions({ limit: 100 }),
      ]);

      setSop(sopRes.data);
      setTotal(sopRes.total ?? 0);
      setDivisionsData(divisionRes || []); // Set data divisi ke state
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
    value: d.id, // Sesuaikan properti id/value sesuai dengan balikan API Divisi
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
          resetUrlFilter();
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
          resetUrlFilter();
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
      // Tambahkan default value array kosong jika value undefined agar .map tidak error
      renderCell: (value: any) =>
        value && Array.isArray(value)
          ? value.map((d: any) => renderTag(d.name))
          : "-",
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

  // Load awal ketika komponen di-mount
  useEffect(() => {
    loadDatas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memantau perubahan filter URL
  useEffect(() => {
    // Hindari reset dan pemanggilan ganda jika loadDatas baru saja dipanggil
    setCurrentPage(1);
    setCurrentIndex(0);
    loadSops(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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