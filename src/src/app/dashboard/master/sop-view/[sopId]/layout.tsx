"use client";
import { SopContext } from "@/features/sop/components/SopContext";
import { useSopActions } from "@/features/sop/hook/useSop";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";
import { Sop } from "@/types/data/sop.types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}
const SopLayout = ({ children }: Props) => {
  const [sop, setSop] = useState<Sop | null>(null);
  const { fetchSopById } = useSopActions();
  const params = useParams();
  const id = parseInt(params.sopId as string);

  const fetchDatas = async () => {
    const data = await fetchSopById(id, { preload: true });
    if (data != null) setSop(data);
  };

  useEffect(() => {
    fetchDatas();
  }, [id]);

  return (
    <SopContext.Provider
      value={{ sop: sop, setSop, path: "/dashboard/master/sop-view" }}
    >
      {children}
    </SopContext.Provider>
  );
};

export default SopLayout;
