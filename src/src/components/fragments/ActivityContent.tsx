"use client";
import clsx from "clsx";
import { ReactNode } from "react";

interface ActivityPanel {
  key: string;
  content: ReactNode;
}

interface ActivityContentProps {
  activeKey: string | null;
  panels: ActivityPanel[];
  isCollapsed?: boolean;
}

export default function ActivityContent({
  activeKey,
  panels,
  isCollapsed = false,
}: ActivityContentProps) {
  return (
    <div
      className={clsx(
        "fixed transition-all duration-200 top-17 w-[80%]  !z-[10]",
        isCollapsed ? "lg:w-[29%] right-11" : "lg:w-[25%] right-11"
      )}
    >
      {panels.map(({ key, content }) => (
        <div
          key={key}
          className={clsx(
            "absolute inset-0 transition-all duration-300",
            activeKey === key
              ? "translate-x-0 pointer-events-auto visible"
              : "translate-x-full pointer-events-none invisible"
          )}
        >
          <div className="border h-screen border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] ">
            {content}
          </div>
        </div>
      ))}
    </div>
  );
}
