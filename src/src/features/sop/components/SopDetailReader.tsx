"use client";

import { useSopContext } from "./SopContext";
import { useEffect, useState } from "react";
import { useSopActions } from "../hook/useSop";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button, Collapse } from "antd";
import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import { useTitleActions } from "@/features/title/hook/useTitle";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";
import { useDivisionActions } from "@/features/division/hook/useDivision";
import DetailBuilder, {
  DetailItem,
} from "@/components/fragments/builder/DetailBuilder";

export const SopDetailReader = () => {
  const { sop, setSop } = useSopContext();
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.sopId as string);

  const { titles } = useTitleActions();
  const { fetchDivisions } = useDivisionActions();
  const { updateSop, fetchSopById } = useSopActions();
  const [titleDatas, setTitleDatas] = useState<any[]>([]);
  const [divisionDatas, setDivisionDatas] = useState<any[]>([]);
  const [data, setData] = useState<any | null>(sop);
  const { hasViewOwnOnly } = useFilterRBAC();
  const pathname = usePathname();
  const isSopView = pathname?.includes("sop-view");
  const isViewOwnOnly = hasViewOwnOnly();
  let extraButton: React.ReactNode = null;

  useEffect(() => {
    setTitleDatas(titles);
  }, [titles]);

  useEffect(() => {
    async function loadDivisions() {
      const data = await fetchDivisions({ limit: 100 });
      setDivisionDatas(data);
    }
    loadDivisions();
  }, []);

  useEffect(() => {
    if (sop) {
      setData(sop);
    }
  }, [sop]);

  const fieldDefs: DetailItem[] = [
    {
      key: "code",
      name: "code",
      label: "Kode SOP",
      value: data?.code,
      renderView: (value: string) => value,
    },
    {
      key: "name",
      name: "name",
      label: "Nama SOP",
      value: data?.name,
      renderView: (value: string) => value,
    },
    {
      key: "division_id",
      name: "division_id",
      label: "Divisi",
      value: data?.division_id,
      renderView: (value: number) => {
        const division = divisionDatas.find((div) => div.id === value);
        return division?.name ?? "-";
      },
    },
    {
      key: "has_titles",
      name: "has_titles",
      label: "Kepemilikan SOP",
      value: data?.has_titles,
      renderView: (values: any[]) =>
        values && values.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {values.map((v) => (
              <span key={v.id}>{v.name}</span>
            ))}
          </div>
        ) : (
          "-"
        ),
    },
    {
      key: "description",
      name: "description",
      label: "Deskripsi SOP",
      value: data?.description,
      renderView: (value: string) =>
        value ? (
          <div
            className="tiptap prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          "-"
        ),
    },
  ];

  if (!data) return null;

  if (!isViewOwnOnly && !isSopView) {
    extraButton = (
      <Button
        icon={<EyeOutlined />}
        onClick={() => router.push(`/dashboard/master/sop-view/${id}`)}
      >
        Preview Detail
      </Button>
    );
  } else if (!isViewOwnOnly && isSopView) {
    extraButton = (
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
        Form Detail
      </Button>
    );
  }

  return (
    <Collapse
      defaultActiveKey={["form"]}
      items={[
        {
          key: "form",
          label: <span className="font-bold text-base">Informasi Umum</span>,
          extra: extraButton,
          children: <DetailBuilder items={fieldDefs} />,
        },
      ]}
    />
  );
};

export default SopDetailReader;
