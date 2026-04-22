"use client";

import FormBuilder from "@/components/fragments/builder/FormBuilder";
import InputEditor from "@/components/fragments/editor/InputEditor";
import { Wrapper } from "@/components/fragments/Wrapper";
import { renderTag, renderTexts } from "@/components/ui/Tag";
import { useDivisionActions } from "@/features/division/hook/useDivision";
import { useTitleActions } from "@/features/title/hook/useTitle";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";
import { Sop } from "@/types/data/sop.types";
import { FormProps } from "@/types/props/form.types";
import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSopActions } from "../hook/useSop";
import { UpdateSopDto } from "../types/sop.types";
import { useSopContext } from "./SopContext";

export const SopDetail = () => {
  const { sop, setSop } = useSopContext();
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.sopId as string);

  const { titles } = useTitleActions();
  const { fetchDivisions } = useDivisionActions();
  const [divisionsData, setDivisionsData] = useState<any[]>([]);
  const { updateSop, fetchSopById } = useSopActions();
  const [data, setData] = useState<Sop | null>(sop);
  const { hasViewOwnOnly } = useFilterRBAC();
  const pathname = usePathname();
  const isSopView = pathname?.includes("sop-view");
  const isViewOwnOnly = hasViewOwnOnly();
  let extraButton: React.ReactNode = null;

  useEffect(() => {
    if (sop) {
      setData(sop);
    }
  }, [sop]);

  useEffect(() => {
    async function loadDivisions() {
      const data = await fetchDivisions({ limit: 100 });
      setDivisionsData(data);
    }
    loadDivisions();
  }, []);

  const fields: FormProps[] = useMemo(() => [
    {
      name: "code",
      type: "input",
      label: "Kode SOP",
      editable: false,
      rules: [{ required: false, message: "Kode SOP wajib diisi!" }],
      props: {
        size: "middle",
        placeholder: "Kode SOP",
      },
      renderView: (value: string) => value,
    },
    {
      name: "name",
      type: "input",
      label: "Nama SOP",
      editable: true,
      rules: [{ required: false, message: "Nama SOP wajib diisi!" }],
      props: {
        size: "middle",
        placeholder: "Nama SOP",
      },
      renderView: (value: string) => value,
    },
    {
      name: "has_divisions",
      type: "multiselect",
      label: "Divisi",
      editable: true,
      options: divisionsData.map((opt: any) => ({
        label: opt.name,
        value: opt.id,
      })),
      rules: [{ required: false, message: "Divisi wajib diisi!" }],
      props: {
        size: "middle",
        placeholder: "Divisi",
      },
      renderView: (values: any) => {
        return (values ?? []).map((val: any) =>
          renderTag(val.name, undefined, val.id)
        );
      },
    },
    // {
    //   name: "has_titles",
    //   type: "multiselect",
    //   label: "Kepemilikan SOP",
    //   editable: true,
    //   options: titles.map((opt: any) => ({
    //     label: opt.name,
    //     value: opt.id,
    //   })),
    //   rules: [
    //     { required: false, message: "Posisi Kepemilikan SOP wajib diisi!" },
    //   ],
    //   props: {
    //     placeholder: "Pilih Posisi Kepemilikan SOP",
    //   },
    //   renderView: (values: any[]) => (
    //     <div className="mt-2">{renderTexts(values)}</div>
    //   ),
    // },
    {
      name: "description",
      type: "description",
      editable: true,
      label: "Deskripsi SOP",
      width: "full",
      rules: [{ required: false, message: "Deskripsi SOP wajib diisi!" }],
      props: {
        size: "middle",
        placeholder: "Deskripsi SOP",
      },
      renderView: (value: string) => {
        return value ? <InputEditor editable={false} value={value} /> : "-";
      },
    },
  ], [divisionsData, titles]);

  const handleSubmit = async (values: any) => {
    const payload: UpdateSopDto = {
      name: values.name,
      description: values.description,
      code: values.code,
      division_id: values.division_id,
      has_titles: values.has_titles,
    };

    await updateSop(id, payload);
    const res = await fetchSopById(id, { preload: true });
    if (res) setSop(res);
  };

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
    <Wrapper title="Informasi Umum" extra={extraButton}>
      <FormBuilder
        record={data}
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText="Simpan"
        autoComplete="on"
        layout="row"
        buttonProps={{
          size: "middle",
          width: "fit",
          position: "end",
        }}
        editMode={true}
        permission="update"
      />
    </Wrapper>
  );
};
