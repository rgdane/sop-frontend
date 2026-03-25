import { TableBuilder } from "@/components/fragments/builder/TableBuilder";
import TableSearch from "@/components/ui/Table/ColumnSearch";
import { renderTag } from "@/components/ui/Tag";
import { useSopContext } from "@/features/sop/components/SopContext";
import { useSopActions } from "@/features/sop/hook/useSop";
import { useSpkActions } from "@/features/spk/hook/useSpk";
import { SopJob } from "@/types/data/sop_job.types";
import { TableBuilderProps } from "@/types/props/table.types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSopJobActions } from "../hook/useSopJob";
import { CreateSopJobDto } from "../types/sop_job.types";
import { CreateModal } from "@/components/ui/Modal/CreateModal";
import { TableRowDragHandle } from "@/components/fragments/builder/TableBuilder";
import { ResponseSpkDto } from "@/features/spk/types/spk.types";
import { getDomainUrl } from "@/lib/getFullUrl";
import { capitalizeFirstLetter } from "@/lib/capitalize";
import { Sop } from "@/types/data/sop.types";
import Button from "@/components/ui/Button";

interface ReferenceData {
  sop: any[];
  spk: any[];
  instruction: any[];
}

export const SopJobList = ({
  sopJobs,
  setSopJobs,
}: {
  sopJobs: any;
  setSopJobs: any;
}) => {
  const {
    fetchSopJobs,
    createSopJob,
    updateSopJob,
    deleteSopJob,
    bulkCreateSopJobs,
    bulkUpdateSopJobs,
    bulkDeleteSopJobs,
    reorderSopJob,
  } = useSopJobActions();
  const { fetchSops, createSop } = useSopActions();
  const { fetchSpks, createSpk } = useSpkActions();
  const [unassignedSopOptions, setUnassignedSopOptions] = useState<any[]>([]);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [referenceType, setReferenceType] = useState("instruction");
  const [flowchartType, setFlowchartType] = useState(1);
  const [allReferenceDatas, setAllReferenceDatas] = useState<ReferenceData>({
    sop: [],
    spk: [],
    instruction: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [referenceLabel, setReferenceLabel] = useState("Referensi");
  const [defaultSelectedSop, setDefaultSelectedSop] = useState<number | null>(
    null
  );
  const [defaultSelectedSpk, setDefaultSelectedSpk] = useState<number | null>(
    null
  );

  const previousSopJobsRef = useRef<SopJob[]>([]);

  const param = useParams();
  const router = useRouter();
  const sopId = Number(param.sopId);
  const { sop, divisions } = useSopContext();
  const loadDatas = useCallback(async () => {
    setIsLoading(true);
    try {
      const sopJobs = await fetchSopJobs({ sop_id: sopId, preload: true });
      const sortedSopJobs = sopJobs.sort((a, b) => a.index - b.index);
      setSopJobs(sortedSopJobs);
      previousSopJobsRef.current = sopJobs;
    } catch (error) {
      console.error("Error loading sop jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSopJobs, sopId]);

  const loadReferenceDatas = useCallback(
    async (type: string) => {
      let data: any[] = [];
      try {
        switch (type) {
          case "sop":
            const sopResponse = await fetchSops({ exclude_id: sopId });
            data = sopResponse.data;
            break;
          case "spk":
            const spkResponse: ResponseSpkDto = await fetchSpks();
            data = spkResponse.data;
            break;
          case "instruction":
            // TODO: Implement instruction fetching if you have the API
            // const instructionResponse = await fetchInstructions();
            // data = instructionResponse.data;
            data = []; // Placeholder for now
            break;
          default:
            data = [];
            break;
        }
      } catch (error) {
        console.error(`Error loading ${type} reference data:`, error);
        data = [];
      }
      return data;
    },
    [fetchSops, fetchSpks]
  );

  const loadAllReferenceDatas = useCallback(async () => {
    try {
      const allSopResponse = await fetchSops({ preload: true });
      const allSopData = allSopResponse.data;

      const sopResponse = await fetchSops({ exclude_id: sopId });
      const sopData = sopResponse.data;

      const [spkData, instructionData] = await Promise.all([
        loadReferenceDatas("spk"),
        loadReferenceDatas("instruction"),
      ]);

      setAllReferenceDatas({
        sop: allSopData,
        spk: spkData,
        instruction: instructionData,
      });

      setUnassignedSopOptions(sopData);
    } catch (error) {
      console.error("Error loading all reference data:", error);
    }
  }, [fetchSops, sopId, loadReferenceDatas]);

  useEffect(() => {
    loadAllReferenceDatas();
  }, []);

  const getReferenceLabel = useCallback(
    (type: string, id: number) => {
      if (!id || !type) return "-";

      const data = allReferenceDatas[type as keyof ReferenceData] || [];
      const referenceItem = data.find((item: any) => item.id === id);

      return referenceItem?.name || referenceItem?.title || `ID: ${id}`;
    },
    [allReferenceDatas]
  );

  const getDynamicOptionsFunc = useCallback(
    (type: string, record?: any) => {
      if (!type) return [];
      let data = allReferenceDatas[type as keyof ReferenceData] || [];
      let options = [];
      if (type === "sop") {
        options = unassignedSopOptions.map((item: any) => ({
          label:
            `${item.code} - ${item.name}` || item.title || `ID: ${item.id}`,
          value: item.id,
        }));
      } else {
        options = data.map((item: any) => ({
          label:
            `${item.code} - ${item.name}` || item.title || `ID: ${item.id}`,
          value: item.id,
        }));
      }
      if (record && record.reference_id) {
        const exists = options.some(
          (opt: { value: any }) => opt.value == record.reference_id
        );
        if (!exists) {
          const refData = data.find(
            (item: any) => item.id == record.reference_id
          );
          if (refData) {
            options.push({
              label: refData.name || refData.title || `ID: ${refData.id}`,
              value: refData.id,
            });
          }
        }
      }
      return options;
    },
    [allReferenceDatas, unassignedSopOptions]
  );

  const getReferenceColumns = (referenceType: string) => {
    let columns: TableBuilderProps<Sop>["columns"] = [
      {
        key: "name",
        title: `Nama ${referenceType.toUpperCase()}`,
        dataIndex: "name",
        editable: true,
        inputType: "text",
        placeholder: `Masukkan nama ${referenceType.toUpperCase()}`,
        rules: [
          {
            required: true,
            message: `Nama ${referenceType.toUpperCase()} wajib diisi.`,
          },
        ],
      },
    ];

    if (referenceType === "sop")
      columns.push({
        key: "division_id",
        title: `Divisi`,
        dataIndex: "division_id",
        editable: true,
        inputType: "select",
        options: divisions?.map((division) => ({
          label: division.name,
          value: division.id,
        })),
        placeholder: `Masukkan kode ${referenceType.toUpperCase()}`,
        rules: [
          {
            required: true,
            message: `Kode ${referenceType.toUpperCase()} wajib diisi.`,
          },
        ],
      });

    if (referenceType === "spk")
      columns.push({
        key: "code",
        title: `Kode ${referenceType.toUpperCase()}`,
        dataIndex: "code",
        editable: true,
        inputType: "text",
        placeholder: `Masukkan kode ${referenceType.toUpperCase()}`,
        rules: [
          {
            required: true,
            message: `Kode ${referenceType.toUpperCase()} wajib diisi.`,
          },
        ],
      });

    return columns;
  };

  const columns: TableBuilderProps<SopJob>["columns"] = useMemo(
    () => [
      {
        key: "dragHandle",
        title: "",
        dataIndex: "dragHandle",
        width: 50,
        renderCell: () => <TableRowDragHandle />,
      },
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
        key: "alias",
        title: "Alias",
        dataIndex: "alias",
        editable: true,
        inputType: "text",
        renderDataView: true,
        placeholder: "Masukkan alias pekerjaan",
        ...TableSearch("Alias"),
        rules: [{ required: false, message: "Alias pekerjaan wajib diisi." }],
      },
      {
        key: "code",
        title: "Kode",
        dataIndex: "code",
        editable: false,
        renderCell: (value: string) => (value ? value : "-"),
      },
      {
        key: "title_id",
        title: "Dikerjakan Oleh",
        dataIndex: "title_id",
        inputType: "select",
        editable: true,
        placeholder: "Pilih Jabatan",
        options: (() => {
          const titles: any[] = [];
          const currentSop = allReferenceDatas.sop?.find((s: any) => s.id === sopId);
          if (currentSop?.has_divisions && Array.isArray(currentSop.has_divisions)) {
            currentSop.has_divisions.forEach((division: any) => {
              if (division.positions && Array.isArray(division.positions)) {
                division.positions.forEach((position: any) => {
                  if (position.titles && Array.isArray(position.titles)) {
                    position.titles.forEach((title: any) => {
                      if (!titles.find((t) => t.value === title.id)) {
                        titles.push({
                          label: title.name,
                          value: title.id,
                        });
                      }
                    });
                  }
                });
              }
            });
          }

          return titles;
        })(),
        renderCell: (_: unknown, record: any) => {
          const name = record.has_title ? record.has_title.name : "";
          const label = name || "-";
          // const color = name ? "#1890ff" : "#9b9b9b";
          return label;
        },
      },
      {
        key: "type",
        title: "Dikerjakan Menggunakan",
        dataIndex: "type",
        inputType: "radio",
        inputWidth: "full",
        editable: true,
        defaultValue: referenceType,
        onChange: (value: string) => {
          setReferenceType(value);
        },
        options: [
          { label: "IK", value: "instruction" },
          { label: "SOP", value: "sop" },
          { label: "SPK", value: "spk" },
        ],
        renderCell: (_: unknown, record: any) => {
          const typeLabelMap: Record<string, string> = {
            sop: "SOP",
            spk: "SPK",
            instruction: "IK",
          };
          const typeColorMap: Record<string, string> = {
            sop: "#e850ffff",
            spk: "#ff4148ff",
            instruction: "#1fdf1fff",
          };
          const label = typeLabelMap[record.type] || "-";
          const colorClass = typeColorMap[record.type];

          if (record.type === "sop" || record.type === "spk") {
            return (
              <span
                className="hover:cursor-pointer"
                onClick={() =>
                  router.push(
                    `/dashboard/master/sop?node=${record.type}-${record.reference_id}`
                  )
                }
              >
                {renderTag(label, colorClass)}
              </span>
            );
          }
          return renderTag(label, colorClass);
        },
      },
      {
        key: "is_published",
        title: "Status",
        dataIndex: "is_published",
        editable: true,
        inputType: "radio",
        inputWidth: "full",
        defaultValue: true,
        options: [
          { label: "Published", value: true },
          { label: "Draft", value: false },
        ],
        renderCell: (_: unknown, record: any) => {
          const label = record.is_published ? "Published" : "Draft";
          const colorClass = record.is_published ? "#52c41aff" : "#faad14ff";
          return renderTag(label, colorClass);
        },
      },
      {
        key: "is_hide",
        title: "LK",
        dataIndex: "is_hide",
        editable: true,
        inputType: "radio",
        inputWidth: "full",
        defaultValue: true,
        options: [
          { label: "Sembunyikan", value: true },
          { label: "Pasang", value: false },
        ],
        renderCell: (_: unknown, record: any) => {
          const label = record.is_hide ? "Sembunyikan" : "Terpasang";
          const colorClass = record.is_hide ? "#57595B" : "#8BAE66";
          return renderTag(label, colorClass);
        },
      },
      {
        key: "reference_id",
        title: referenceLabel,
        getDynamicTitles: (record: any) => {
          return record.type && record.type !== "instruction"
            ? `Pilih ${capitalizeFirstLetter(record.type)}`
            : "Referensi";
        },
        dataIndex: "reference_id",
        inputType: "select",
        inputWidth: "full",
        editable: true,
        defaultValue:
          referenceType === "sop" ? defaultSelectedSop : defaultSelectedSpk,
        disabled: (record: any) =>
          !record.type || record.type === "instruction",
        placeholder: "Pilih Referensi",
        options: [],
        getDynamicOptions: (record) => {
          const type = record.type;
          if (!type) {
            return [];
          }
          return getDynamicOptionsFunc(type, record);
        },
        renderDataView: false,
        renderCell: (_: unknown, record: any) => {
          return getReferenceLabel(record.type, record.reference_id);
        },
        dependencies: ["type"],
        addDataOption: (record: any) => {
          if (record.type === "instruction") return;
          setReferenceType(record.type);
          setIsReferenceModalOpen(true);
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
        useBulkAction: false,
      },
      {
        key: "flowchart_id",
        title: "Flowchart",
        dataIndex: "flowchart_id",
        editable: true,
        defaultValue: flowchartType,
        renderDataView: false,
        useBulkAction: false,
        inputType: "radio",
        inputWidth: "full",
        onChange: (value: any) => {
          setFlowchartType(value);
        },
        placeholder: "Pilih Flowchart",
        options: [
          { label: "Prosess", value: 1 },
          { label: "Decision", value: 2 },
        ],
      },
      {
        key: "reference_code",
        title: "Referensi",
        dataIndex: "reference_code",
        editable: false,
        renderDataView: true,
        renderCell: (_: unknown, record: any) => {
          const code = record.has_reference?.code;
          if (!code || !record.type || !record.reference_id) return "-";
          return (
            <Button
              type="link"
              variant="text"
              className="!underline"
              onClick={() => {
                if (record.type === "sop" || record.type === "spk") {
                  router.push(
                    `/dashboard/master/${record.type}/${record.reference_id}`
                  );
                }
              }}
            >
              {code}
            </Button>
          );
        },
      },

      {
        key: "next_index",
        title: "Decision: Ya?",
        dataIndex: "next_index",
        editable: true,
        renderDataView: false,
        inputType: "select",
        useBulkAction: false,
        placeholder: "Pilih Tujuan",
        getDynamicOptions: (record: SopJob) => {
          return sopJobs
            .filter((job: SopJob) => job.id !== record.id)
            .map((job: SopJob) => ({
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
        useBulkAction: false,
        placeholder: "Pilih Tujuan",
        getDynamicOptions: (record: SopJob) => {
          return sopJobs
            .filter((job: SopJob) => job.id !== record.id)
            .map((job: SopJob) => ({
              label: job.name,
              value: job.index,
            }));
        },
        dependencies: ["flowchart_id"],
        disabled: (record: any) => record.flowchart_id !== 2,
      },
    ],
    [
      allReferenceDatas,
      sopId,
      getReferenceLabel,
      getDynamicOptionsFunc,
      sopJobs,
    ]
  );

  useEffect(() => {
    loadDatas();
  }, [sopId]);

  const handleCreate = useCallback(
    async (data: Omit<SopJob, "id">) => {
      try {
        const payload: CreateSopJobDto = {
          ...data,
          sop_id: sopId,
          url: getDomainUrl() ?? "",
        };
        await createSopJob(payload);
        await loadDatas();
        setDefaultSelectedSop(null);
        setDefaultSelectedSpk(null);
        setReferenceType("instruction");
      } catch (error) {
        console.error("Error creating sop job:", error);
      } finally {
        await loadDatas();
      }
    },
    [createSopJob, sopId, loadDatas]
  );

  const handleGenerator = useCallback(
    async (data: Omit<SopJob, "id">) => {
      if (!sop?.name) {
        console.error("Nama SOP dari konteks tidak ditemukan.");
        return;
      }

      const jobPrefixes = [
        `Menyusun SPK ${sop.name}`,
        `Menerbitkan ${sop.name}`,
        `Memvalidasi ${sop.name}`,
        `Mendokumentasikan ${sop.name}`,
      ];

      const aliasPrefixes = [
        `SPK ${sop.name}`,
        `${sop.name} Terbit`,
        `${sop.name} Validasi`,
        `${sop.name} Dokumentasi`,
      ];

      const bulkPayload: any[] = jobPrefixes.map((jobName, i: any) => ({
        name: jobName, // Gunakan nama yang sudah digenerate
        sop_id: sopId,
        alias: aliasPrefixes[i] || "",
      }));

      try {
        await bulkCreateSopJobs(bulkPayload);
        await loadDatas();
      } catch (error) {
        console.error("Gagal membuat SOP jobs secara massal:", error);
      }
    },
    [sop, sopId, bulkCreateSopJobs, loadDatas] // Sesuaikan dependensi
  );

  const handleUpdate = useCallback(
    async (id: number, data: Partial<SopJob>) => {
      try {
        const payload = {
          ...data,
          url: getDomainUrl() ?? "",
        };

        await updateSopJob(id, payload);
        await loadDatas();
        await loadAllReferenceDatas();
        setDefaultSelectedSop(null);
        setDefaultSelectedSpk(null);
        setReferenceType("instruction");
      } catch (error) {
        console.error("Error updating sop job:", error);
      } finally {
        await loadDatas();
      }
    },
    [updateSopJob, loadDatas, loadAllReferenceDatas]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteSopJob(id);
        await loadDatas();
        await loadAllReferenceDatas();
      } catch (error) {
        console.error("Error deleting sop job:", error);
      } finally {
        await loadDatas();
      }
    },
    [deleteSopJob, loadDatas, loadAllReferenceDatas]
  );

  const handleBulkUpdate = useCallback(async (ids: number[], data: any) => {
    try {
      await bulkUpdateSopJobs(ids, data);
      await loadDatas();
      await loadAllReferenceDatas();
    } catch (error) {
      console.error("Error bulk updating sop jobs:", error);
    } finally {
      await loadDatas();
    }
  }, []);

  const handleBulkCreate = useCallback(async (data: Omit<SopJob, "id">[]) => {
    try {
      const newData = data.map((item) => ({
        ...item,
        sop_id: sopId,
        url: getDomainUrl() ?? "",
      }));
      await bulkCreateSopJobs(newData);
      await loadDatas();
      await loadAllReferenceDatas();
    } catch (error) {
      console.error("Error bulk creating sop jobs:", error);
    } finally {
      await loadDatas();
    }
  }, []);

  const handleBulkDelete = useCallback(async (ids: number[]) => {
    try {
      await bulkDeleteSopJobs(ids);
      await loadDatas();
      await loadAllReferenceDatas();
    } catch (error) {
      console.error("Error bulk deleting sop jobs:", error);
    } finally {
      await loadDatas();
    }
  }, []);

  const handleReferenceModalSubmit = async (data: any) => {
    try {
      if (referenceType === "sop") {
        const res = await createSop(data);
        setDefaultSelectedSop(res.id);
      }
      if (referenceType === "spk") {
        const res = await createSpk(data);
        setDefaultSelectedSpk(res.id);
      }

      await loadAllReferenceDatas();
    } catch (error) {
      console.error("Error creating reference:", error);
    } finally {
      setIsReferenceModalOpen(false);
    }
  };

  const handleDrawerEvent = {
    close: () => {
      setDefaultSelectedSop(null);
      setDefaultSelectedSpk(null);
      setReferenceType("instruction");
    },
  };

  return (
    <>
      <TableBuilder<SopJob>
        datas={sopJobs}
        columns={columns}
        useDrawer
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onBulkCreate={handleBulkCreate}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        onDrawer={handleDrawerEvent}
        useGenerator={sopJobs.length === 0 && sop ? true : false}
        onGenerator={{
          onGenerate: handleGenerator,
          title: "Generate SOP SPK",
        }}
        loading={isLoading}
        onDrag={async (targetData, currentData) => {
          const targetIndex = sopJobs.findIndex(
            (job: SopJob) => job.id === targetData.id
          );
          if (targetIndex === -1) return;

          try {
            await reorderSopJob(currentData.id, targetIndex + 1, sopId);
            await loadDatas();
          } catch (error) {
            console.error("Failed to reorder sop job:", error);
          }
        }}
      />
      <CreateModal
        open={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        onSubmit={handleReferenceModalSubmit}
        columns={getReferenceColumns(referenceType)}
        zIndex={2001}
      />
    </>
  );
};
