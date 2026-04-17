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
  // Ambil fungsinya, bukan datanya
  const { fetchDivisions } = useDivisionActions(); 
  
  const params = useParams();
  const id = parseInt(params.sopId as string);

  const fetchDatas = async () => {
    try {
      // Jalankan kedua fetch secara paralel
      const [sopData, divisionsRes] = await Promise.all([
        fetchSopById(id, { preload: true }),
        fetchDivisions({ limit: 100 }),
      ]);

      if (sopData != null) setSop(sopData);
      
      if (divisionsRes && divisionsRes) {
        setDivisions(divisionsRes);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // Validasi id agar tidak fetch jika id NaN (misal di halaman create yg tidak pakai params.sopId)
    if (!isNaN(id)) {
      fetchDatas();
    } else {
      const fetchOnlyDivisions = async () => {
        try {
          const divisionsRes = await fetchDivisions({ limit: 100 });
          if (divisionsRes && divisionsRes) {
            setDivisions(divisionsRes);
          }
        } catch (error: any) {
          console.error("Error fetching divisions:", error);
        }
      };
      fetchOnlyDivisions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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