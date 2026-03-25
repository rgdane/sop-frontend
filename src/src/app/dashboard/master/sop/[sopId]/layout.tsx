"use client";
import { useDivisionActions } from "@/features/division/hook/useDivision";
import { SopContext } from "@/features/sop/components/SopContext";
import { useSopActions } from "@/features/sop/hook/useSop";
import { Division } from "@/types/data/division.types";
import { Sop } from "@/types/data/sop.types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}
const SopLayout = ({ children }: Props) => {
  const [sop, setSop] = useState<Sop | null>(null);
  const [divisions, setDivisions] = useState<Division[] | null>(null);
  const { fetchSopById } = useSopActions();
  const { divisions: divisionsData } = useDivisionActions();
  const params = useParams();
  const id = parseInt(params.sopId as string);

  const fetchDatas = async () => {
    const [sopData] = await Promise.all([
      fetchSopById(id, { preload: true }),
    ]);
    if (sopData != null) setSop(sopData);
    setDivisions(divisionsData);
  };

  useEffect(() => {
    fetchDatas();
  }, [id]);

  return (
    <SopContext.Provider
      value={{
        sop: sop,
        divisions: divisions,
        setSop,
        path: "/dashboard/master/sop",
      }}
    >
      {children}
    </SopContext.Provider>
  );
};

export default SopLayout;
