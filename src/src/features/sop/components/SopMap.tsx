"use client";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position,
  type ColorMode,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useMemo, useRef, useState } from "react";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";
import { useSopActions } from "@/features/sop/hook/useSop";
import { useSpkActions } from "@/features/spk/hook/useSpk";
import { useSopJobActions } from "@/features/sop-job/hook/useSopJob";
import { useSpkJobActions } from "@/features/spk-job/hook/useSpkJob";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, Spin } from "antd";

// --- INTERFACE & DATA ---
interface Sop {
  id: number;
  name: string;
  code: string;
  has_divisions?: { name: string };
}

interface Spk {
  id: number;
  name: string;
  code: string;
}

interface SopJob {
  id: number;
  sop_id: number;
  type: string | null;
  reference_id: number | null;
  index?: number | null; // TAMBAHKAN INI
}

interface SpkJob {
  id: number;
  spk_id: number;
  sop_id?: number | null;
}

// --- CUSTOM NODE ---
const NODE_WIDTH = 250; // Sesuaikan dengan lebar node
const NODE_HEIGHT = 70; // Perkiraan tinggi node

const EntityNode = ({
  data,
  isHighlighted = false,
}: {
  data: { label: string; code: string; type: "sop" | "spk"; division?: string };
  isHighlighted?: boolean;
}) => (
  <div
    style={{ width: `${NODE_WIDTH}px`, minWidth: `${NODE_WIDTH}px` }}
    className={`rounded-lg p-3 shadow-md text-sm border-l-4 transition-all duration-300 ${isHighlighted
      ? "bg-yellow-300 border-yellow-600 shadow-lg ring-2 ring-yellow-500 dark:bg-yellow-700 dark:border-yellow-400 dark:ring-yellow-300"
      : data.type === "sop"
        ? "bg-fuchsia-300 border-fuchsia-600 hover:border-fuchsia-500 dark:bg-fuchsia-700 dark:border-fuchsia-400 dark:hover:border-fuchsia-300"
        : "bg-red-300 border-red-600 hover:border-red-500 dark:bg-red-700 dark:border-red-400 dark:hover:border-red-300"
      }`}
  >
    <Handle type="target" position={Position.Left} className="!bg-slate-400" />
    <Handle type="source" position={Position.Right} className="!bg-slate-400" />
    <div className="font-bold text-black dark:text-white">{data.label}</div>
    <div className="font-medium text-black/60 dark:text-white/60 mt-1">
      {data.code}
    </div>
    {data.type === "sop" && (
      <div className="font-normal text-black/60 dark:text-white/60 mt-1">
        Divisi: {data.division || "-"}
      </div>
    )}
  </div>
);

const nodeTypes = {
  entity: ({ data }: { data: any }) => <EntityNode data={data} isHighlighted={data.isHighlighted} />,
};

// --- 2. FUNGSI UNTUK LAYOUT OTOMATIS ---

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  sopJobs: SopJob[],
  direction = "LR"
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 100,
    nodesep: 80
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Layout normal dengan Dagre
  dagre.layout(dagreGraph);

  // Kelompokkan jobs berdasarkan sop_id
  const jobsBySop = new Map<number, Array<{ nodeId: string; index: number }>>();

  sopJobs.forEach((job) => {
    if (job.type && job.reference_id && job.index != null) {
      const nodeId = `${job.type}-${job.reference_id}`;
      if (!jobsBySop.has(job.sop_id)) {
        jobsBySop.set(job.sop_id, []);
      }
      jobsBySop.get(job.sop_id)!.push({ nodeId, index: job.index });
    }
  });

  // Post-processing: Sort nodes dengan sop_id sama berdasarkan index
  jobsBySop.forEach((jobs, sopId) => {
    const existingJobs = jobs
      .filter(j => dagreGraph.node(j.nodeId))
      .map(j => ({
        ...j,
        node: dagreGraph.node(j.nodeId)
      }));

    if (existingJobs.length <= 1) return;

    // Sort berdasarkan index
    existingJobs.sort((a, b) => a.index - b.index);

    // Kelompokkan berdasarkan posisi X yang sama (toleransi 50px)
    const xGroups = new Map<number, typeof existingJobs>();
    existingJobs.forEach(job => {
      const x = Math.round(job.node.x / 50) * 50; // Round ke 50px terdekat
      if (!xGroups.has(x)) {
        xGroups.set(x, []);
      }
      xGroups.get(x)!.push(job);
    });

    // Untuk setiap grup X, redistribute posisi Y dengan spacing tetap
    xGroups.forEach(group => {
      if (group.length <= 1) return;

      const spacing = 140; // Jarak vertikal antar nodes
      const avgY = group.reduce((sum, j) => sum + j.node.y, 0) / group.length;
      const totalHeight = (group.length - 1) * spacing;
      const startY = avgY - (totalHeight / 2);

      group.forEach((job, idx) => {
        job.node.y = startY + (idx * spacing);
      });
    });
  });

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

// --- KOMPONEN UTAMA ---
export default function SopMap() {
  const [colorMode, setColorMode] = useState<ColorMode>("system");
  const { fetchSops } = useSopActions();
  const { fetchSpks } = useSpkActions();
  const { fetchSopJobs } = useSopJobActions();
  const { fetchSpkJobs } = useSpkJobActions();

  const [sops, setSops] = useState<Sop[]>([]);
  const [spks, setSpks] = useState<Spk[]>([]);
  const [sopJobs, setSopJobs] = useState<SopJob[]>([]);
  const [spkJobs, setSpkJobs] = useState<SpkJob[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "related" | "isolated">("all");
  const [filterType, setFilterType] = useState<"all" | "sop" | "spk">("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil query node dari URL jika ada
  useEffect(() => {
    const nodeParam = searchParams.get("node");
    if (nodeParam) {
      setSelectedNodeId(nodeParam);
      setHighlightedNodes(new Set([nodeParam]));
    } else {
      setSelectedNodeId("");
      setHighlightedNodes(new Set());
    }
  }, [searchParams, isLoading]);

  const clearSearchByUser = useRef(false);
  const filterChangedByUser = useRef(false);

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setHighlightedNodes(nodeId ? new Set([nodeId]) : new Set());
    if (!nodeId) {
      clearSearchByUser.current = true;
      // Hapus query param node dari URL
      const params = new URLSearchParams(window.location.search);
      params.delete('node');
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      router.replace(newUrl);
    } else {
      clearSearchByUser.current = false;
      // Update query param node jika node dipilih
      const params = new URLSearchParams(window.location.search);
      params.set('node', nodeId);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl);
    }
  };

  const handleFilterTypeChange = (value: "all" | "sop" | "spk") => {
    setFilterType(value);
    filterChangedByUser.current = true;
  };

  const handleFilterModeChange = (value: "all" | "related" | "isolated") => {
    setFilterMode(value);
    filterChangedByUser.current = true;
  };

  // Fungsi untuk handle select node
  const nodeOptions = [
    ...sops.map((sop) => ({
      value: `sop-${sop.id}`,
      label: `${sop.name}`,
    })),
    ...spks.map((spk) => ({
      value: `spk-${spk.id}`,
      label: `${spk.name}`,
    })),
  ];

  // Komponen internal untuk menggunakan useReactFlow
  const ReactFlowWrapper = () => {
    const reactFlowInstance = useReactFlow();

    // Effect untuk auto-zoom ke node yang dipilih
    useEffect(() => {
      // Pastikan ReactFlow dan node sudah siap
      if (reactFlowInstance && nodes.length > 0) {
        if (selectedNodeId) {
          const selectedNode = nodes.find(node => node.id === selectedNodeId);
          if (selectedNode) {
            // Zoom ke node yang dipilih dengan animasi
            setTimeout(() => {
              reactFlowInstance.setCenter(
                selectedNode.position.x + NODE_WIDTH / 2,
                selectedNode.position.y + NODE_HEIGHT / 2,
                { zoom: 1.5, duration: 500 }
              );
            }, 100);
          }
        } else if (clearSearchByUser.current) {
          // Zoom out (fitView) hanya jika clear search dari user
          setTimeout(() => {
            reactFlowInstance.fitView({ duration: 500 });
          }, 100);
          clearSearchByUser.current = false;
        }
      }
    }, [selectedNodeId, reactFlowInstance, nodes, isLoading]);
    useEffect(() => {
      if (reactFlowInstance && nodes.length > 0 && !selectedNodeId && filterChangedByUser.current) {
        setTimeout(() => {
          reactFlowInstance.fitView({ duration: 500 });
        }, 100);
        filterChangedByUser.current = false;
      }
    }, [filterType, filterMode, reactFlowInstance, nodes.length]);

    return (
      <>
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        <Controls />
      </>
    );
  };

  // Sinkronisasi dengan theme localStorage
  useEffect(() => {
    const updateColorMode = () => {
      const theme = localStorage.getItem("theme");
      if (theme === "dark") {
        setColorMode("dark");
      } else if (theme === "light") {
        setColorMode("light");
      } else {
        setColorMode("system");
      }
    };

    // Set initial value
    updateColorMode();

    // Listen untuk perubahan localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        updateColorMode();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Listen untuk perubahan manual pada localStorage (same tab)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === "theme") {
        updateColorMode();
      }
    };

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  useEffect(() => {
    async function fetchAll() {
      setIsLoading(true);
      try {
        const [sopRes, spkRes, sopJobRes, spkJobRes] = await Promise.all([
          fetchSops({ preload: true }),
          fetchSpks({ preload: true }),
          fetchSopJobs(),
          fetchSpkJobs()
        ]);

        setSops(sopRes.data || []);
        setSpks(spkRes.data || []);
        setSopJobs(sopJobRes || []);
        setSpkJobs(spkJobRes || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Filter nodes dan edges berdasarkan state
  const { nodes, edges } = useMemo(() => {
    if (isLoading) {
      return { nodes: [], edges: [] };
    }

    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];
    const allEntities = new Map<
      string,
      { data: Sop | Spk; type: "sop" | "spk" }
    >();
    sops.forEach((sop) =>
      allEntities.set(`sop-${sop.id}`, { data: sop, type: "sop" })
    );
    spks.forEach((spk) =>
      allEntities.set(`spk-${spk.id}`, { data: spk, type: "spk" })
    );
    sopJobs.forEach((job) => {
      if (job.type && job.reference_id) {
        const sourceId = `sop-${job.sop_id}`;
        const targetId = `${job.type}-${job.reference_id}`;
        if (allEntities.has(sourceId) && allEntities.has(targetId)) {
          initialEdges.push({
            id: `edge-sopjob-${job.id}`,
            source: sourceId,
            target: targetId,
            type: "bezier",
            style: { stroke: "#6b7280", strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
          });
        }
      }
    });
    // Tambahkan edge dari SpkJob ke SOP
    spkJobs.forEach((job) => {
      if (job.sop_id) {
        const sourceId = `spk-${job.spk_id}`;
        const targetId = `sop-${job.sop_id}`;
        if (allEntities.has(sourceId) && allEntities.has(targetId)) {
          initialEdges.push({
            id: `edge-spkjob-${job.id}`,
            source: sourceId,
            target: targetId,
            type: "bezier",
            style: { stroke: "#6b7280", strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
          });
        }
      }
    });
    // Filter nodes sesuai kombinasi dua filter
    let filteredNodeIds: Set<string>;
    let baseNodeIds: string[];
    if (filterMode === "related") {
      baseNodeIds = [
        ...initialEdges.map((e) => e.source),
        ...initialEdges.map((e) => e.target),
      ];
    } else if (filterMode === "isolated") {
      const relatedIds = new Set([
        ...initialEdges.map((e) => e.source),
        ...initialEdges.map((e) => e.target),
      ]);
      baseNodeIds = Array.from(allEntities.keys()).filter(
        (id) => !relatedIds.has(id)
      );
    } else {
      baseNodeIds = Array.from(allEntities.keys());
    }
    // Filter jenis
    if (filterType === "sop") {
      baseNodeIds = baseNodeIds.filter((id) => id.startsWith("sop-"));
    } else if (filterType === "spk") {
      baseNodeIds = baseNodeIds.filter((id) => id.startsWith("spk-"));
    }
    filteredNodeIds = new Set(baseNodeIds);
    filteredNodeIds.forEach((id) => {
      const entity = allEntities.get(id);
      if (entity) {
        let division = "";
        if (entity.type === "sop") {
          division = (entity.data as any)?.has_divisions?.name || "";
        }
        initialNodes.push({
          id: id,
          type: "entity",
          data: {
            label: entity.data.name,
            code: entity.data.code,
            type: entity.type,
            division: division,
            isHighlighted: highlightedNodes.has(id),
          },
          position: { x: 0, y: 0 },
        });
      }
    });
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      sopJobs // TAMBAHKAN PARAMETER INI
    );
    return { nodes: layoutedNodes, edges: layoutedEdges };
  }, [sops, spks, sopJobs, spkJobs, filterMode, filterType, isLoading, highlightedNodes]);

  // --- RENDER ---
  return (
    <div className="w-full h-[600px] border border-black/10 dark:border-white/10 rounded-xl bg-white dark:bg-[#1e1e1e] overflow-hidden relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spin size="large" />
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Memuat Data...
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mengambil dan Menyusun Diagram
            </div>
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 24,
          zIndex: 10,
          borderRadius: 8,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Select
          showSearch
          allowClear
          placeholder="Cari dan pilih node SOP/SPK..."
          style={{ width: 350 }}
          value={selectedNodeId || undefined}
          onChange={handleSelectNode}
          options={nodeOptions}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 16,
          right: 24,
          zIndex: 10,
          borderRadius: 8,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <label className="font-semibold" style={{ marginRight: 8 }}>
          Jenis:
        </label>
        <Select
          value={filterType}
          onChange={handleFilterTypeChange}
          style={{ minWidth: 120 }}
          options={[
            { value: "all", label: "Semua" },
            { value: "sop", label: "SOP" },
            { value: "spk", label: "SPK" },
          ]}
        />
        <label
          className="font-semibold"
          style={{ marginLeft: 8, marginRight: 8 }}
        >
          Opsi :
        </label>
        <Select
          value={filterMode}
          onChange={handleFilterModeChange}
          style={{ minWidth: 250 }}
          options={[
            { value: "all", label: "Semua" },
            { value: "related", label: "Hanya yang punya relasi" },
            { value: "isolated", label: "Hanya yang belum punya relasi" },
          ]}
        />
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode={colorMode}
        onNodeClick={(_, node) => {
          if (node.id.startsWith("sop-")) {
            const sopId = node.id.replace("sop-", "");
            router.push(`/dashboard/master/sop/${sopId}`);
          } else if (node.id.startsWith("spk-")) {
            const spkId = node.id.replace("spk-", "");
            router.push(`/dashboard/master/spk/${spkId}`);
          }
        }}
      >
        <ReactFlowWrapper />
      </ReactFlow>
      <style>{`.react-flow__attribution { display: none !important; }`}</style>
    </div>
  );
}
