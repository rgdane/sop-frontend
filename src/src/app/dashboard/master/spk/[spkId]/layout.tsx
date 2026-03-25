"use client";
import { SpkContext } from "@/features/spk/components/SpkContext";
import { useSpkActions } from "@/features/spk/hook/useSpk";
import { Spk } from "@/types/data/spk.types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}
const SpkLayout = ({ children }: Props) => {
  const [spk, setSpk] = useState<Spk | null>(null);
  const { fetchSpkById } = useSpkActions();
  const params = useParams();
  const id = parseInt(params.spkId as string);

  const fetchDatas = async () => {
    const data = await fetchSpkById(id, { preload: true });
    if (data != null) setSpk(data);
  };

  useEffect(() => {
    fetchDatas();
  }, [id]);

  return (
    <SpkContext.Provider
      value={{ spk: spk, setSpk, path: "/dashboard/master/spk" }}
    >
      {children}
    </SpkContext.Provider>
  );
};

export default SpkLayout;
