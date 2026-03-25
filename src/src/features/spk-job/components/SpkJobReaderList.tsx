"use client";

import React, { useState, useEffect } from "react";
import { JSONContent, generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { TableViewer } from "@/components/fragments/builder/TableViewer";
import { SpkJob } from "@/types/data/spk_job.types";
import { useSpkJobActions } from "../hook/useSpkJob";
import { CustomColumnProps } from "@/types/props/column.types";
import { Flowchart } from "@/components/fragments/Flowchart";
import { Collapse } from "antd";
import { useParams } from "next/navigation";
import { renderJSONToHTML } from "@/components/fragments/editor/utils/renderHTML";
import { ViewerEditor } from "@/components/fragments/editor/ViewerEditor";

export const SpkJobReaderList = () => {
  const param = useParams();
  const spkId = Number(param.spkId);
  const [spkJobs, setSpkJobs] = useState<SpkJob[]>([]);
  const [loading, setLoading] = useState(true);

  const { fetchSpkJobs } = useSpkJobActions();

  const loadSpkJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchSpkJobs({ spk_id: spkId, preload: true });
      // Sort by index
      const sortedData = data.sort((a, b) => (a.index || 0) - (b.index || 0));
      setSpkJobs(sortedData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpkJobs();
  }, []);

  const columns: CustomColumnProps<SpkJob>[] = [
    {
      key: "name",
      title: "Nama",
      dataIndex: "name",
      width: 100,
      renderDataView: true,
    },
    {
      key: "sop_id",
      title: "Nama SOP",
      dataIndex: "sop_id",
      renderDataView: true,
      width: 100,
      renderCell: (_: unknown, record: any) => {
        return record.has_sop ? record.has_sop.name : "-";
      },
    },
    {
      key: "description",
      title: "Deskripsi",
      dataIndex: "description",
      width: 600,
      renderDataView: true,
      renderCell: (description: any) => (
        <div className="border border-black/10 dark:border-white/10 p-3 rounded-lg">
          <ViewerEditor value={description} />
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
                  datas={spkJobs}
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
              children: <Flowchart data={spkJobs} header={false} />,
            },
          ]}
        />
      </div>
    </div>
  );
};
