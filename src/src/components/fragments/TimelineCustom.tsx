"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Wrapper } from "./Wrapper";
import { Empty, Select } from "antd";
import dayjs from "dayjs";
import { StockOutlined } from "@ant-design/icons";

interface GanttTask {
  id: number;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  open?: boolean;
  parent?: number;
  priority?: "High" | "Medium" | "Low";
  assignee?: string;
}

interface GanttData {
  data: GanttTask[];
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
};

const parseDate = (str: string) => {
  const [day, month, year] = str.split("-");
  return new Date(+year, +month - 1, +day);
};

const getDateRange = (
  tasks: GanttTask[],
  viewMode: "day" | "week" | "month"
): Date[] => {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  // Parse start and end dates for each task
  const dates: Date[] = tasks.flatMap((task) => {
    const start = parseDate(task.start_date);
    if (isNaN(start.getTime())) return []; // skip invalid date
    const end = new Date(start);
    end.setDate(end.getDate() + (task.duration || 0));
    return [start, end];
  });

  if (dates.length === 0) return [];

  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const startDate = new Date(min);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1); // +1 tahun dari task pertama

  const range: Date[] = [];
  const cur = new Date(startDate);

  while (cur <= endDate) {
    range.push(new Date(cur));
    switch (viewMode) {
      case "week":
        cur.setDate(cur.getDate() + 7);
        break;
      case "month":
        cur.setMonth(cur.getMonth() + 1);
        break;
      case "day":
      default:
        cur.setDate(cur.getDate() + 1);
        break;
    }
  }

  return range;
};

const getPriorityColor = (priority: string = "Medium") => {
  switch (priority) {
    case "High":
      return "bg-red-500 dark:bg-red-900 ";
    case "Medium":
      return "bg-yellow-500 dark:bg-yellow-900";
    case "Low":
      return "bg-green-500 dark:bg-green-900 ";
    default:
      return "bg-gray-500 dark:bg-gray-900";
  }
};

const getPriorityBg = (priority: string = "Medium") => {
  switch (priority) {
    case "High":
      return "bg-red-200 dark:bg-red-900";
    case "Medium":
      return "bg-yellow-200 dark:bg-yellow-900";
    case "Low":
      return "bg-green-200 dark:bg-green-900";
    default:
      return "bg-gray-200 dark:bg-gray-900";
  }
};

export const Timeline = ({ data }: { data: GanttData }) => {
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  const dateRange = useMemo(
    () => getDateRange(data.data, viewMode),
    [data, viewMode]
  );

  const getColumnSpan = (task: GanttTask) => {
    const taskStart = parseDate(task.start_date);
    const taskEnd = new Date(taskStart);
    taskEnd.setDate(taskEnd.getDate() + task.duration - 1); // -1 karena duration termasuk hari mulai

    const firstDate = dateRange[0];

    let offset = 0;
    let span = 0;

    switch (viewMode) {
      case "week":
        offset = Math.floor(
          (taskStart.getTime() - firstDate.getTime()) /
            (1000 * 60 * 60 * 24 * 7)
        );
        span = Math.ceil(task.duration / 7);
        break;
      case "month":
        // Calculate offset in months
        offset =
          (taskStart.getFullYear() - firstDate.getFullYear()) * 12 +
          (taskStart.getMonth() - firstDate.getMonth());

        // Calculate span berdasarkan bulan yang benar-benar di-span
        const startMonthYear =
          taskStart.getFullYear() * 12 + taskStart.getMonth();
        const endMonthYear = taskEnd.getFullYear() * 12 + taskEnd.getMonth();

        // Span adalah selisih bulan + 1 (karena minimal 1 bulan)
        span = endMonthYear - startMonthYear + 0.5;
        break;
      default:
        offset = Math.floor(
          (taskStart.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        span = task.duration - 1;
    }

    return { offset, span };
  };

  const toggleExpanded = (taskId: number) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getTaskEndDate = (task: GanttTask) => {
    const start = parseDate(task.start_date);
    const end = new Date(start);
    end.setDate(end.getDate() + task.duration - 1);
    return end;
  };

  const getUnitWidth = () => {
    switch (viewMode) {
      case "week":
        return 60;
      case "month":
        return 100;
      default:
        return 60;
    }
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleBarMouseEnter = (taskId: number, event: React.MouseEvent) => {
    setHoveredTask(taskId);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleBarMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleBarMouseLeave = () => {
    setHoveredTask(null);
  };

  const viewOptions = [
    { label: "Day", value: "day" },
    { label: "Month", value: "month" },
  ];

  const today = new Date();
  const todayOffset =
    dateRange.length > 0
      ? Math.round(
          (today.getTime() - dateRange[0].getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  const barAreaWidth = dateRange.length * getUnitWidth();

  const hoveredTaskData = hoveredTask
    ? data.data.find((task) => task.id === hoveredTask)
    : null;

  return (
    <Wrapper title="Timeline" icon={<StockOutlined size={20} />}>
      {data.data.length > 0 ? (
        <div className="relative">
          <div className="flex justify-end mb-4">
            <div className="w-[10rem]">
              <Select
                options={viewOptions}
                value={viewMode}
                onChange={setViewMode}
                placeholder="Filter by"
                className="font-normal w-full"
              />
            </div>
          </div>

          <div className="border-t rounded-l-lg border-black/10 dark:border-white/10 overflow-y-auto max-h-[600px]">
            <div className="flex">
              {/* Sidebar */}
              <div className="w-[200px] lg:inline hidden bg-[#f9fafb] dark:bg-[#2a2a2a] relative">
                <div className="h-[40px] border-b border-black/10 dark:border-white/10" />
                {data.data.map((item, index) => (
                  <div
                    key={item.id}
                    className="h-[40px] px-4 flex items-center gap-2 border-b border-black/10 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-[#4a4a4a] relative"
                  >
                    {item.parent && (
                      <button onClick={() => toggleExpanded(item.id)}>
                        {expandedTasks.has(item.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-xs">{item.text}</div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${getPriorityColor(
                        item.priority
                      )}`}
                      title={`Priority: ${item.priority || "Medium"}`}
                    />
                  </div>
                ))}
              </div>

              {/* Gantt chart content */}
              <div className="flex-1 overflow-x-auto">
                <div style={{ width: barAreaWidth }}>
                  {/* Header tanggal */}
                  <div className="flex gap-x-4 h-[40px] border-b border-black/10 dark:border-white/10">
                    {dateRange.map((date, index) => (
                      <div
                        key={index}
                        className="text-xs text-center border-r border-black/10 dark:border-white/10 py-2"
                        style={{ width: getUnitWidth() }}
                      >
                        {viewMode === "month"
                          ? dayjs(date).format("MMM YYYY")
                          : dayjs(date).format("DD MMM")}
                      </div>
                    ))}
                  </div>

                  {/* Rows + Bars */}
                  {data.data.map((item) => (
                    <div
                      key={item.id}
                      className="relative flex items-center h-[40px] px-2 border-b border-black/10 dark:border-white/10"
                    >
                      <div
                        className={`relative border border-black/10 dark:border-white/30 rounded-lg cursor-pointer transition-all duration-200 hover:opacity-80 ${
                          getTaskEndDate(item) < today && item.progress < 1
                            ? " bg-slate-200 dark:bg-[#2a2a2a] "
                            : getPriorityBg(item.priority)
                        }`}
                        style={{
                          marginLeft:
                            getColumnSpan(item).offset * getUnitWidth(),
                          width: getColumnSpan(item).span * getUnitWidth(),
                        }}
                        onMouseEnter={(e) => handleBarMouseEnter(item.id, e)}
                        onMouseMove={handleBarMouseMove}
                        onMouseLeave={handleBarMouseLeave}
                      >
                        <div className="text-xs font-medium text-center py-1">
                          {item.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cursor-following tooltip */}
          {hoveredTaskData && (
            <div
              className="fixed z-[9999] bg-white dark:bg-[#4a4a4a]  text-xs rounded-lg p-3 shadow-lg min-w-[200px] pointer-events-none"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 10,
                transform: "translate(0, -100%)",
              }}
            >
              <div className="font-semibold mb-1">{hoveredTaskData.text}</div>
              <div className="">
                {formatDate(parseDate(hoveredTaskData.start_date))} -{" "}
                {formatDate(getTaskEndDate(hoveredTaskData))}
              </div>
              <div className=" mt-1">
                Priority: {hoveredTaskData.priority || "Medium"}
              </div>
              {hoveredTaskData.assignee && (
                <div className=" mt-1">
                  Assignee: {hoveredTaskData.assignee}
                </div>
              )}
              <div className=" mt-1">
                Progress: {Math.round((hoveredTaskData.progress || 0) * 100)}%
              </div>
              <div className=" mt-1">
                Duration: {hoveredTaskData.duration} days
              </div>
            </div>
          )}
        </div>
      ) : (
        <Empty description="No data found" />
      )}
    </Wrapper>
  );
};
