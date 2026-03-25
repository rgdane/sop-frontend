"use client";
import { useState, useRef } from "react";
import { renderTag } from "../../ui/Tag";
import { Badge } from "antd";
import { TaskCard } from "./TaskCard";
import { Wrapper } from "../Wrapper";

export const KanbanBoard = ({
  sections,
  onTaskMove,
  onStatusChange,
  statuses,
}: any) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(idx);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX;
      const scrollAmount = 40;
      if (mouseX > rect.right - 60) {
        containerRef.current.scrollLeft += scrollAmount;
      }
      if (mouseX < rect.left + 60) {
        containerRef.current.scrollLeft -= scrollAmount;
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };

  const handleDragLeave = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, toSectionIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
    const {
      sectionIndex: fromSectionIndex,
      taskIndex: fromTaskIndex,
      task,
    } = dragData;

    if (fromSectionIndex === toSectionIndex) return;

    onTaskMove({
      fromSectionIndex,
      fromTaskIndex,
      sectionIndex: toSectionIndex,
      task,
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex gap-4 overflow-x-auto pb-4 w-full "
      style={{ scrollBehavior: "auto" }}
    >
      {sections.map((section: any, sectionIndex: number) => (
        <div
          key={section.title + sectionIndex}
          className="group"
          style={{ minWidth: 350, flex: 1 }}
          onDragOver={(e) => handleDragOver(e, sectionIndex)}
          onDragEnter={(e) => handleDragEnter(e, sectionIndex)}
          onDragLeave={(e) => handleDragLeave(e, sectionIndex)}
          onDrop={(e) => handleDrop(e, sectionIndex)}
        >
          <Wrapper
            title={
              <div className="flex items-center gap-3">
                {renderTag(section.title, section.color)}
                <Badge
                  count={`${section.count}`}
                  style={{
                    border: `1px solid ${section.color}`,
                    backgroundColor: "transparent",
                    color: section.color,
                    boxShadow: "none",
                    fontWeight: 600,
                  }}
                />
              </div>
            }
          >
            <div
              className={`flex flex-col gap-3 max-h-[600px] border-2 border-dashed overflow-y-auto duration-300 rounded p-4 ${
                dragOverIndex === sectionIndex
                  ? "bg-blue-100/50 dark:bg-blue-50/10 border-blue-200 rounded-lg "
                  : "border-black/10 dark:border-white/10"
              }`}
            >
              {section.tasks.map((task: any, taskIndex: number) => (
                <TaskCard
                  key={taskIndex}
                  task={task}
                  sectionIndex={sectionIndex}
                  taskIndex={taskIndex}
                  onStatusChange={onStatusChange}
                  statuses={statuses}
                  currentStatusId={section.statusIds[0]}
                />
              ))}
              {section.tasks.length === 0 && (
                <div className="text-center py-8 text-black/50 dark:text-white/50 text-sm">
                  No tasks in this column
                </div>
              )}
            </div>
          </Wrapper>
        </div>
      ))}
    </div>
  );
};
