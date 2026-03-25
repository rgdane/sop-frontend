import { useParams } from "next/navigation";
import { useSpkJobActions } from "../hook/useSpkJob";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SpkJob } from "@/types/data/spk_job.types";
import { TableBuilderProps } from "@/types/props/table.types";
import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import { useSopActions } from "@/features/sop/hook/useSop";
import { CreateSpkJobDto, UpdateSpkJobDto } from "../types/spk_job.types";
import TableSearch from "@/components/ui/Table/ColumnSearch";
import { useSpkContext } from "@/features/spk/components/SpkContext";
import { CreateModal } from "@/components/ui/Modal/CreateModal";
import { Sop } from "@/types/data/sop.types";
import { useSpkJobDragDrop } from "../hook/useSpkJobDragDrop";
import { getDomainUrl } from "@/lib/getFullUrl";

export const SpkJobList = ({
  spkJobDatas,
  setSpkJobDatas,
}: {
  spkJobDatas: any;
  setSpkJobDatas: any;
}) => {
  const {
    fetchSpkJobs,
    createSpkJob,
    updateSpkJob,
    deleteSpkJob,
    bulkCreateSpkJobs,
    bulkDeleteSpkJobs,
    reorderSpkJob,
  } = useSpkJobActions();
  const { fetchSops, createSop } = useSopActions();

  const [sopDatas, setSopDatas] = useState<any[]>([]);
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);

  const param = useParams();
  const spkId = Number(param.spkId);
  const { spk } = useSpkContext();

  const loadDatas = async () => {
    const [spkJobs, sopResponse] = await Promise.all([
      fetchSpkJobs({ spk_id: spkId, preload: true }),
      fetchSops(),
    ]);

    const sortedSpkJobs = spkJobs.sort(
      (a, b) => (a.index || 0) - (b.index || 0)
    );

    setSpkJobDatas(sortedSpkJobs);
    setSopDatas(sopResponse.data); // Extract the data array from the response
  };

  const handleSopCreate = async (data: Omit<Sop, "id">) => {
    await createSop(data);
    await loadDatas();
    setIsSopModalOpen(false);
  };

  const spkJobDragDrop = useSpkJobDragDrop({
    spkJobs: spkJobDatas,
    spkId: spk?.id || 0,
    onReorder: async (spkJobId: number, newIndex: number, spkId: number) => {
      const originalSpkJobs = [...spkJobDatas];

      try {
        await reorderSpkJob(spkJobId, newIndex, spkId);

        await loadDatas();
      } catch (error) {
        console.error("❌ Reorder failed, rolling back:", error);
        setSpkJobDatas(originalSpkJobs);
        throw error;
      }
    },
  });

  const dragColumn = spkJobDragDrop.dragDropTable.getDragColumn();

  const columns: TableBuilderProps<SpkJob>["columns"] = useMemo(
    () => [
      ...(dragColumn
        ? [
            {
              key: dragColumn.key,
              title: (dragColumn.title as string) || "",
              dataIndex: "dragHandle",
              width: dragColumn.width,
              renderCell: (_: any, record: SpkJob) => {
                const currentIndex = spkJobDatas.findIndex(
                  (spkJob: any) => spkJob.id === record.id
                );
                return dragColumn.renderDragHandles(record, currentIndex);
              },
            },
          ]
        : []),
      {
        key: "name",
        title: "Nama Pekerjaan",
        dataIndex: "name",
        editable: true,
        inputType: "text",
        renderDataView: true,
        placeholder: "Masukkan nama pekerjaan",
        ...TableSearch("Nama Pekerjaan"),
        rules: [{ required: true, message: "Nama pekerjaan wajib diisi." }],
      },
      {
        key: "title_id",
        title: "Dikerjakan oleh",
        dataIndex: "title_id",
        editable: true,
        inputType: "select",
        options: spk?.has_titles?.map((data) => ({
          label: data.name,
          value: data.id,
        })),
        placeholder: "Pilih Jabatan",
        renderCell: (_: unknown, record: any) => {
          return record.has_title ? record.has_title.name : "-";
        },
      },
      {
        key: "description",
        title: "Deskripsi",
        dataIndex: "description",
        editable: true,
        inputType: "editor",
        placeholder: "Masukkan deskripsi",
        renderDataView: false,
      },
      {
        key: "sop_id",
        title: "Nama SOP",
        dataIndex: "sop_id",
        inputType: "select",
        editable: true,
        renderDataView: false,
        placeholder: "Pilih SOP",
        options: sopDatas.map((data) => ({ label: data.name, value: data.id })),
        addDataOption: () => {
          setIsSopModalOpen(true);
        },
        renderCell: (_: unknown, record: any) => {
          return record.has_sop ? record.has_sop.name : "-";
        },
      },
      {
        key: "flowchart_id",
        title: "Flowchart",
        dataIndex: "flowchart_id",
        editable: true,
        renderDataView: false,
        inputType: "select",
        placeholder: "Pilih Flowchart",
        options: [
          { label: "Prosess", value: 1 },
          { label: "Decision", value: 2 },
        ],
      },
      {
        key: "next_index",
        title: "Decision: Ya?",
        dataIndex: "next_index",
        editable: true,
        renderDataView: false,
        inputType: "select",
        placeholder: "Pilih Tujuan",
        getDynamicOptions: (record: SpkJob) => {
          return spkJobDatas
            .filter((job: SpkJob) => job.id !== record.id)
            .map((job: SpkJob) => ({
              label: job.name,
              value: job.index,
            }));
        },
        dependencies: ["flowchart_id"],
        disabled: (record: any) => record.flowchart_id !== 2,
      },
      {
        key: "prev_index",
        title: "Decision: Tidak?",
        dataIndex: "prev_index",
        editable: true,
        renderDataView: false,
        inputType: "select",
        placeholder: "Pilih Tujuan",
        getDynamicOptions: (record: SpkJob) => {
          return spkJobDatas
            .filter((job: SpkJob) => job.id !== record.id)
            .map((job: SpkJob) => ({
              label: job.name,
              value: job.index,
            }));
        },
        dependencies: ["flowchart_id"],
        disabled: (record: any) => record.flowchart_id !== 2,
      },
    ],
    [spk?.has_titles, dragColumn, spkJobDatas, sopDatas]
  );

  const sopColumns: TableBuilderProps<Sop>["columns"] = [
    {
      key: "code",
      title: "Kode SOP",
      dataIndex: "code",
      editable: true,
      inputType: "text",
      placeholder: "Masukkan kode SOP",
      rules: [{ required: true, message: "Kode SOP wajib diisi." }],
    },
    {
      key: "name",
      title: "Nama SOP",
      dataIndex: "name",
      editable: true,
      inputType: "text",
      placeholder: "Masukkan nama SOP",
      rules: [{ required: true, message: "Nama SOP wajib diisi." }],
    },
  ];

  useEffect(() => {
    loadDatas();
  }, [spkId]);

  const handleCreate = async (data: Omit<SpkJob, "id">) => {
    const payload: CreateSpkJobDto = {
      ...data,
      spk_id: spkId,
      url: getDomainUrl() ?? "",
    };
    await createSpkJob(payload);
    await loadDatas();
  };

  const handleUpdate = async (id: number, data: any) => {
    let payload = {
      ...data,
      url: getDomainUrl() ?? "",
    };
    await updateSpkJob(id, payload);
    await loadDatas();
  };

  const handleDelete = async (id: number) => {
    await deleteSpkJob(id);
    await loadDatas();
  };

  const handleBulkCreate = useCallback(async (data: Omit<SpkJob, "id">[]) => {
    try {
      const newData = data.map((item) => ({
        ...item,
        spk_id: spkId,
        url: getDomainUrl() ?? "",
      }));
      await bulkCreateSpkJobs(newData);
      await loadDatas();
    } catch (error) {
      console.error("Error bulk creating spk jobs:", error);
    }
  }, []);

  const handleBulkDelete = async (ids: number[]) => {
    await bulkDeleteSpkJobs(ids);
    await loadDatas();
  };

  return (
    <>
      <TableBuilder<SpkJob>
        title="Daftar Pekerjaan SPK"
        description="Daftar pekerjaan SPK"
        datas={spkJobDatas}
        columns={columns}
        useDrawer
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onBulkCreate={handleBulkCreate}
        onBulkDelete={handleBulkDelete}
        rowProps={(record: SpkJob, index: number) =>
          spkJobDragDrop.dragDropTable.getRowProps(record, index)
        }
      />

      {/* SOP Creation Modal */}
      <CreateModal
        open={isSopModalOpen}
        onClose={() => setIsSopModalOpen(false)}
        onSubmit={handleSopCreate}
        columns={sopColumns}
        zIndex={2001}
      />
    </>
  );
};
