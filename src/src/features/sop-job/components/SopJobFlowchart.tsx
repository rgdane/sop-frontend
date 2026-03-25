import { useSopActions } from "@/features/sop/hook/useSop";
import { useSpkActions } from "@/features/spk/hook/useSpk";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSopJobActions } from "../hook/useSopJob";
import { ResponseSpkDto } from "@/features/spk/types/spk.types";
import { Flowchart } from "@/components/fragments/Flowchart";
import { SopJob } from "@/types/data/sop_job.types";

interface ReferenceData {
  sop: any[];
  spk: any[];
  instruction: any[];
}

export const SopJobFlowchart = ({ data }: { data: SopJob[] }) => {
  const { fetchSopJobs } = useSopJobActions();
  const { fetchSops } = useSopActions();
  const { fetchSpks } = useSpkActions();

  const [allReferenceDatas, setAllReferenceDatas] = useState<ReferenceData>({
    sop: [],
    spk: [],
    instruction: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const referenceDataLoadedRef = useRef(false);
  const previousSopJobsRef = useRef<SopJob[]>([]);

  const param = useParams();
  const sopId = Number(param.sopId);

  const loadDatas = useCallback(async () => {
    setIsLoading(true);
    try {
      const sopJobs = await fetchSopJobs({ sop_id: sopId, preload: true });
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
            const sopResponse = await fetchSops();
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

  useEffect(() => {
    if (referenceDataLoadedRef.current) return;

    const loadAllReferenceDatas = async () => {
      try {
        const [sopData, spkData, instructionData] = await Promise.all([
          loadReferenceDatas("sop"),
          loadReferenceDatas("spk"),
          loadReferenceDatas("instruction"),
        ]);

        setAllReferenceDatas({
          sop: sopData,
          spk: spkData,
          instruction: instructionData,
        });

        referenceDataLoadedRef.current = true;
      } catch (error) {
        console.error("Error loading all reference data:", error);
      }
    };

    loadAllReferenceDatas();
  }, [loadReferenceDatas]);

  useEffect(() => {
    loadDatas();
  }, [sopId]);

  return !isLoading && <Flowchart data={data} />;
};
