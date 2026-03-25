"use client";
import Button from "../../ui/Button";
import {
  CalendarOutlined,
  EyeOutlined,
  FlagOutlined,
  MoreOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { renderAvatar } from "../../ui/Avatar";
import Card from "../../ui/Card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "antd";
import Tag from "@/components/ui/Tag";
import Dropdown from "@/components/ui/Dropdown";

export const TaskCard = ({ task, sectionIndex, taskIndex, onStatusChange, statuses, currentStatusId }: any) => {
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        sectionIndex,
        taskIndex,
        task,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const moveStatusItems = statuses
    ?.filter((status: any) => status.value !== currentStatusId)
    .map((status: any) => ({
      key: `move_${status.value}`,
      label: status.label,
      onClick: () => onStatusChange(task, status.value),
    }));

  return (
    <Card
      size="small"
      className={`mb-3 cursor-grab transition-all duration-300 !border !border-black/10 dark:!border-white/10 ${isDragging
        ? "opacity-50 scale-95"
        : "hover:shadow-lg hover:!border-[#ff675780]"
        }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4
            className="font-semibold text-sm mb-0 cursor-pointer hover:underline"
            onClick={(e) => {
              if (task.id) {
                router.push(`/dashboard/scrum/todo/${task.id}`);
              } else {
                console.warn("Task tidak memiliki id", task);
              }
            }}
          >
            {task.title}
          </h4>
          {task.backlogName && (
            <p className="text-xs text-black/50 dark:text-white/50 mt-1 mb-0">
              {task.backlogName}
            </p>
          )}
        </div>
        <Tooltip title="Menu">
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "view",
                  label: "Lihat",
                  icon: <EyeOutlined />,
                  onClick: () => {
                    if (task.id) {
                      router.push(`/dashboard/scrum/todo/${task.id}`);
                    } else {
                      console.warn("Task tidak memiliki id", task);
                    }
                  },
                },
                {
                  type: "divider",
                },
                {
                  key: "move",
                  label: "Pindahkan Status",
                  icon: <SwapOutlined />,
                  children: moveStatusItems,
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Tooltip>
      </div>



      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {renderAvatar(task.assignees)}
          <div className="flex gap-x-4">
            <Tag
              color={
                task.priority === "high"
                  ? "red"
                  : task.priority === "medium"
                    ? "orange"
                    : "blue"
              }
            >
              <div className="flex gap-x-1">
                <FlagOutlined style={{ fontSize: "10px" }} />
                {task.priority}
              </div>
            </Tag>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-black/50 dark:text-white/50">
          <CalendarOutlined />
          {task.dueDate}
        </div>
      </div>
      {Array.isArray(task.children) && task.children.length > 0 && (
        <div className="mt-3 border-t border-black/5 dark:border-white/10 pt-2">
          <div className="text-xs font-semibold uppercase text-black/40 dark:text-white/40 mb-1">
            Sub Tasks
          </div>
          <div className="flex flex-col gap-1">
            {task.children.map((child: any) => (
              <div key={child.id} className="flex items-center justify-between text-xs">
                <a
                  href={`/dashboard/scrum/todo/${child.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-black/70 dark:text-white/70 hover:underline"
                >
                  {child.title}
                </a>
                {child.status ? (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      border: `1px solid ${child.statusColor || "#e5e7eb"}`,
                      color: child.statusColor || "#6b7280",
                    }}
                  >
                    {child.status}
                  </span>
                ) : (
                  <span className="text-[10px] text-black/40 dark:text-white/40">
                    -
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
