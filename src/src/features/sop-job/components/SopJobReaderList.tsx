"use client";

import React, { useState, useEffect } from "react";

import { TableViewer } from "@/components/fragments/builder/TableViewer";
import { SopJob } from "@/types/data/sop_job.types";
import { useSopJobActions } from "../hook/useSopJob";
import { CustomColumnProps } from "@/types/props/column.types";
import { Flowchart } from "@/components/fragments/Flowchart";
import { Collapse } from "antd";
import { useParams, useRouter } from "next/navigation";
import { ViewerEditor } from "@/components/fragments/editor/ViewerEditor";
import { renderTag } from "@/components/ui/Tag";

export const SopJobReaderList = () => {
  const param = useParams();
  const router = useRouter();
  const sopId = Number(param.sopId);
  const [sopJobs, setSopJobs] = useState<SopJob[]>([]);
  const [loading, setLoading] = useState(true);

  const { fetchSopJobs } = useSopJobActions();

  const loadSopJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchSopJobs({ sop_id: sopId, preload: true });
      // Sort by index
      const sortedData = data.sort((a, b) => (a.index || 0) - (b.index || 0));
      setSopJobs(sortedData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSopJobs();
  }, []);

  const columns: CustomColumnProps<SopJob>[] = [
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      width: 100,
      renderDataView: true,
    },
    {
      key: "type",
      title: "Dikerjakan Menggunakan",
      dataIndex: "type",
      inputType: "select",
      editable: true,
      placeholder: "Pilih salah satu",
      width: 100,
      options: [
        { label: "SOP", value: "sop" },
        { label: "SPK", value: "spk" },
        { label: "Instruksi Kerja", value: "instruction" },
      ],
      renderCell: (_: unknown, record: any) => {
        const typeLabelMap: Record<string, string> = {
          sop: "SOP",
          spk: "SPK",
          instruction: "Instruksi Kerja",
        };
        const typeColorMap: Record<string, string> = {
            sop: "#e850ffff",
            spk: "#ff4148ff",
            instruction: "#1fdf1fff",
          }
        // Jika tipe SOP/SPK, tampilkan tombol/link yang redirect ke SopMap dengan query node
        if ((record.type === "sop" || record.type === "spk") && record.reference_id) {
          return (
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => {
                // Redirect ke SopMap dengan query node
                router.push(`/dashboard/master/sop?node=${record.type}-${record.reference_id}`);
              }}
            >
              {renderTag(typeLabelMap[record.type], typeColorMap[record.type])}
            </button>
          );
        }
        // Jika bukan SOP/SPK, tampilkan label biasa
        return renderTag(typeLabelMap[record.type], typeColorMap[record.type]) || "-";
      },
    },
    {
      key: "description",
      title: "",
      dataIndex: "description",
      width: 600,
      renderDataView: true,
      renderCell: (description: any, record: any) => (
        <div className="border border-black/10 dark:border-white/10 p-3 rounded-lg">
          <Collapse
            defaultActiveKey={["description"]}
            items={[
              {
                key: "description",
                label: <span className="font-bold text-base">Deskripsi</span>,
                children: <ViewerEditor value={record.description} />,
              },
              {
                key: "step",
                label: (
                  <span className="font-bold text-base">Langkah - langkah</span>
                ),
                children: <ViewerEditor value={record.step} />,
              },
              {
                key: "output",
                label: (
                  <span className="font-bold text-base">Kerangka Output</span>
                ),
                children: <ViewerEditor value={record.output} />,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mt-4">
        <Collapse
          defaultActiveKey={["table"]}
          items={[
            {
              key: "table",
              label: <span className="font-bold text-base">Pekerjaan</span>,
              children: (
                <TableViewer
                  datas={sopJobs}
                  columns={columns}
                  loading={loading}
                  showIndex={true}
                  showDescriptionToggle={true}
                  descriptionKey="description"
                />
              ),
            },
          ]}
        />
      </div>
      <div className="mt-4">
        <Collapse
          defaultActiveKey={["flowchart"]}
          items={[
            {
              key: "flowchart",
              label: <span className="font-bold text-base">Diagram Alur</span>,
              children: <Flowchart data={sopJobs} header={false} />,
            },
          ]}
        />
      </div>
    </div>
  );
};
