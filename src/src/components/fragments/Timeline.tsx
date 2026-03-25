"use client";

import { useEffect, useRef } from "react";
import gantt from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import { Wrapper } from "./Wrapper";
import { StockOutlined } from "@ant-design/icons";
import { syncGanttColumnWidths } from "@/lib/ganttResizable";

interface GanttTask {
  id: number;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  open?: boolean;
  parent?: number;
}

interface GanttLink {
  id: number;
  source: number;
  target: number;
  type: string;
}

interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}

const Timeline = ({
  data,
  onUpdate,
  updatePermission,
}: {
  data: GanttData;
  onUpdate: (id: number, data: any) => Promise<void>;
  updatePermission?: boolean;
}) => {
  const ganttContainer = useRef<HTMLDivElement>(null);

  // Initial Gantt init
  useEffect(() => {
    if (ganttContainer.current) {
      gantt.config.add_column = false;
      gantt.config.columns = [
        { name: "text", label: "Judul", width: "*", tree: true },
        { name: "start_date", label: "Mulai", align: "center" },
        { name: "duration", label: "Durasi", align: "center" },
        { name: "add", label: "Tambah", width: -5 },
      ];

      gantt.config.readonly = false;
      gantt.config.drag_move = updatePermission;
      gantt.config.drag_resize = updatePermission;
      gantt.config.drag_progress = false;
      gantt.config.drag_links = false;
      gantt.config.drag_project = false;
      gantt.config.details_on_dblclick = false;
      gantt.config.details_on_create = false;
      gantt.config.drag_create = false;

      gantt.init(ganttContainer.current);

      if (updatePermission) {
        gantt.attachEvent("onBeforeTaskDrag", function (id, mode, e) {
          const task = gantt.getTask(id);
          task._original_start_date = new Date(task.start_date);
          task._original_duration = task.duration;
          return true;
        });

        gantt.attachEvent("onAfterTaskDrag", async function (id, mode, e) {
          const updatedTask = gantt.getTask(id);

          const start_date = gantt.date.add(updatedTask.start_date, 1, "day");
          const end_date = gantt.date.add(
            updatedTask.start_date,
            updatedTask.duration,
            "day"
          );

          let formatted;
          if (end_date < start_date) {
            formatted = {
              start_date: gantt.date.add(
                updatedTask._original_start_date,
                1,
                "day"
              ),
              end_date: gantt.date.add(
                updatedTask._original_start_date,
                updatedTask._original_duration,
                "day"
              ),
            };
          } else {
            formatted = { start_date, end_date };
          }

          await onUpdate(updatedTask.id, formatted);
        });
      }
    }

    return () => {
      gantt.clearAll();
      gantt.detachAllEvents();
    };
  }, []);

  useEffect(() => {
    if (data?.data?.length) {
      gantt.clearAll();
      gantt.parse(JSON.parse(JSON.stringify(data)));
    }
    if (ganttContainer.current) {
      const gridData =
        ganttContainer.current!.querySelector(".gantt_grid_data");
      if (gridData) {
        gridData.addEventListener("scroll", () => {
          syncGanttColumnWidths(ganttContainer.current!);
        });
      }
    }
  }, [data]);

  return (
    <Wrapper title="Timeline" icon={<StockOutlined />}>
      <div ref={ganttContainer} className="w-full min-h-[200px]" />
    </Wrapper>
  );
};

export default Timeline;
