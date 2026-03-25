import axiosInstance from "@/config/axios";

export const preFetchDataPdf = async (
  document: any,
  productId?: any,
  projectId?: any
) => {
  const cache: {
    tableRefCache: Record<string, any>;
    graphRefCache: Record<string, any>;
    tableStructureCache: Record<string, any>;
  } = {
    tableRefCache: {},
    graphRefCache: {},
    tableStructureCache: {},
  };


  // ============================
  // Fetchers (pakai versi kamu)
  // ============================

  const fetchTableRef = async (url: string) => {
    const cleanUrl = String(url).replace(/"/g, "");
    try {
      const query = productId ? `?product_id=${productId}` : "";
      const res = await axiosInstance.get(`${cleanUrl}${query}`);
      return res.data?.data ?? [];
    } catch (e) {
      console.error("fetchTableRef error", url, e);
      return [];
    }
  };

  const fetchGraphRows = async (elementId: string) => {
    try {
      const params = productId
        ? { productId }
        : projectId
          ? { projectId }
          : undefined;

      const res = await axiosInstance.get(
        `/graphs/${elementId}`,
        params ? { params } : undefined
      );

      const data = res.data?.data?.[0]?.data ?? null;
      if (!data?.has_column) return [];

      const extracted: any[] = [];
      data.has_column.forEach((col: any) => {
        (col.has_row || []).forEach((r: any) => {
          extracted.push({
            ...r,
            _elementId: r._elementId,
            rowIndex: r.rowIndex,
            value: r.value,
            name: r.name,
          });
        });
      });

      // dedupe rows
      extracted.sort((a, b) => (a.rowIndex ?? 0) - (b.rowIndex ?? 0));
      const latest: Record<number, any> = {};
      for (const r of extracted) latest[r.rowIndex] = r;
      return Object.values(latest);
    } catch (e) {
      console.error("fetchGraphRows error", elementId, e);
      return [];
    }
  };

  const fetchTableStructure = async (elementId: string) => {
    try {
      const params = productId
        ? { productId }
        : projectId
          ? { projectId }
          : undefined;

      const res = await axiosInstance.get(
        `/graphs/${elementId}`,
        params ? { params } : undefined
      );

      const responseData =
        res.data?.data?.[0]?.data ??
        res.data?.data ??
        res.data;

      if (Array.isArray(responseData) && responseData.length > 0) {
        const tableData = responseData[0];
        if (tableData.has_column) return tableData;
      }

      if (responseData?.has_column) return responseData;
      return null;
    } catch (e) {
      console.error("fetchTableStructure error", elementId, e);
      return null;
    }
  };

  // ============================
  // Collect references
  // ============================

  const refs = {
    tableRefs: new Set<string>(),
    graphRefs: new Set<string>(),
    structureRefs: new Set<string>(),
  };

  const collectRefsFromJob = (job: any) => {
    if (!job) return;

    // database (table structure or data)
    if (job.nodeType === "database" && job.tableRef) {
      const isElementId = /^\d+:[a-f0-9-]+:\d+$/i.test(job.tableRef);
      if (isElementId) {
        refs.structureRefs.add(job.tableRef);
      } else {
        refs.tableRefs.add(job.tableRef);
      }
    }

    if (Array.isArray(job.has_column)) {
      job.has_column.forEach((col: any) => {
        // DATABASE → tableRef
        if (col.nodeType === "database" && col.tableRef) {
          refs.tableRefs.add(col.tableRef);
        }

        // TABLE → graphRef rows
        if (col.nodeType === "table" && col.graphRef) {
          refs.graphRefs.add(col.graphRef);
        }

        // CANVAS (recursive)
        if (col.nodeType === "canvas" && Array.isArray(col.has_job)) {
          col.has_job.forEach((cj: any) => collectRefsFromJob(cj));
        }
      });
    }

    // child jobs via reference
    if (Array.isArray(job.has_reference?.[0]?.has_job)) {
      job.has_reference[0].has_job.forEach((sj: any) =>
        collectRefsFromJob(sj)
      );
    }

    // direct has_job
    if (Array.isArray(job.has_job)) {
      job.has_job.forEach((sj: any) => collectRefsFromJob(sj));
    }
  };

  // collect all jobs
  const sopJobs = document?.has_sop?.[0]?.has_job || [];
  const directJobs = document?.has_master?.[0]?.has_job || [];
  const allJobs = [...sopJobs, ...directJobs].filter((j) => j.is_published);

  allJobs.forEach((job) => collectRefsFromJob(job));

  // ============================
  // RUN FETCHES
  // ============================

  const [tableRefs, graphRefs, structureRefs] = await Promise.all([
    Promise.all(
      [...refs.tableRefs].map(async (ref) => ({
        ref,
        rows: await fetchTableRef(ref),
      }))
    ),
    Promise.all(
      [...refs.graphRefs].map(async (id) => ({
        id,
        rows: await fetchGraphRows(id),
      }))
    ),
    Promise.all(
      [...refs.structureRefs].map(async (id) => ({
        id,
        structure: await fetchTableStructure(id),
      }))
    ),
  ]);

  // fill caches
  tableRefs.forEach((t) => (cache.tableRefCache[t.ref] = t.rows));
  graphRefs.forEach((g) => (cache.graphRefCache[g.id] = g.rows));
  structureRefs.forEach((s) => {
    if (s.structure) cache.tableStructureCache[s.id] = s.structure;
  });

  return cache;
};
