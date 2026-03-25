import { useSopActions } from "@/features/sop/hook/useSop";
import { useSpkActions } from "@/features/spk/hook/useSpk";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSpkJobActions } from "../hook/useSpkJob";
import { ResponseSpkDto } from "@/features/spk/types/spk.types";
import { Flowchart } from "@/components/fragments/Flowchart";
import { SpkJob } from "@/types/data/spk_job.types";

interface ReferenceData {
  sop: any[];
  spk: any[];
  instruction: any[];
}

export const SpkJobFlowchart = ({ data }: { data: SpkJob[] }) => {
  const { fetchSpkJobs } = useSpkJobActions();
  const { fetchSops } = useSopActions();
  const { fetchSpks } = useSpkActions();

  const [allReferenceDatas, setAllReferenceDatas] = useState<ReferenceData>({
    sop: [],
    spk: [],
    instruction: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const referenceDataLoadedRef = useRef(false);
  const previousSpkJobsRef = useRef<SpkJob[]>([]);

  const param = useParams();
  const spkId = Number(param.spkId);

  const loadDatas = useCallback(async () => {
    setIsLoading(true);
    try {
      const spkJobs = await fetchSpkJobs({ spk_id: spkId, preload: true });
      previousSpkJobsRef.current = spkJobs;
    } catch (error) {
      console.error("Error loading spk jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSpkJobs, spkId]);

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
    [fetchSpks, fetchSpks]
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
  }, [spkId]);

  return !isLoading && <Flowchart data={data} />;
};
