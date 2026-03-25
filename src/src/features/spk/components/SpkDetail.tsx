import FormBuilder from "@/components/fragments/builder/FormBuilder";
import { renderTag, renderTags } from "@/components/ui/Tag";
import { FormProps } from "@/types/props/form.types";
import { useSpkContext } from "./SpkContext";
import { useEffect, useState } from "react";
import { useSpkActions } from "../hook/useSpk";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Spk } from "@/types/data/spk.types";
import { UpdateSpkDto } from "../types/spk.types";
import { renderJSONToHTML } from "@/components/fragments/editor/utils/renderHTML";
import { JSONContent } from "@tiptap/core";
import { useTitleActions } from "@/features/title/hook/useTitle";
import Button from "@/components/ui/Button";
import ArrowLeftOutlined from "@ant-design/icons/lib/icons/ArrowLeftOutlined";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";
import { EyeOutlined } from "@ant-design/icons";
import { Wrapper } from "@/components/fragments/Wrapper";
import { ViewerEditor } from "@/components/fragments/editor/ViewerEditor";

export const SpkDetail = () => {
  const { spk, setSpk } = useSpkContext();
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.spkId as string);

  const { titles } = useTitleActions();
  const { updateSpk, fetchSpkById } = useSpkActions();
  const [titleDatas, setTitleDatas] = useState<any[]>([]);
  const [data, setData] = useState<Spk | null>(spk);
  const { hasViewOwnOnly } = useFilterRBAC();
  const pathname = usePathname();
  const isSopView = pathname?.includes("spk-view");
  const isViewOwnOnly = hasViewOwnOnly();
  let extraButton: React.ReactNode = null;

  useEffect(() => {
    setTitleDatas(titles);
  }, [titles]);

  useEffect(() => {
    if (spk) {
      setData(spk);
    }
  }, [spk]);

  const fields: FormProps[] = [
    {
      name: "code",
      type: "input",
      label: "Kode SPK",
      editable: false,
      rules: [{ required: false, message: "Kode SPK wajib diisi!" }],
      props: {
        size: "middle",
        placeholder: "Kode SPK",
      },
      renderView: (value: string) => renderTag(value),
    },
    {
      name: "name",
      type: "input",
      label: "Nama SPK",
      editable: true,
      rules: [{ required: false, message: "Nama SPK wajib diisi!" }],
      props: {
        size: "middle",
        placeholder: "Nama SPK",
      },
      renderView: (value: string) => value,
    },
    {
      name: "has_titles",
      type: "multiselect",
      label: "Kepemilikan SPK",
      editable: true,
      options: titleDatas.map((opt: any) => ({
        label: opt.name,
        value: opt.id,
      })),
      rules: [
        { required: false, message: "Posisi Kepemilikan SPK wajib diisi!" },
      ],
      props: {
        placeholder: "Pilih Posisi Kepemilikan SPK",
      },
      renderView: (values: any[]) => (
        <div className="mt-2">{renderTags(values)}</div>
      ),
    },
    {
      name: "description",
      type: "description",
      editable: true,
      label: "Deskripsi SPK",
      rules: [{ required: false, message: "Deskripsi SPK wajib diisi!" }],
      props: {
        size: "middle",
        placeholder: "Deskripsi SPK",
      },
      renderView: (value: JSONContent) => {
        return value ? <ViewerEditor value={value} /> : "-";
      },
    },
  ];

  const handleSubmit = async (values: any) => {
    const payload: UpdateSpkDto = {
      name: values.name,
      description: values.description,
      code: values.code,
      has_titles: values.has_titles,
    };
    await updateSpk(id, payload);
    const res = await fetchSpkById(id, { preload: true });
    if (res) setSpk(res);
  };

  if (!data) return;

  if (!isViewOwnOnly && !isSopView) {
    extraButton = (
      <Button
        icon={<EyeOutlined />}
        onClick={() => router.push(`/dashboard/master/spk-view/${id}`)}
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
