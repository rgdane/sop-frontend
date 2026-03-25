"use client";

import { ReactNode } from "react";
import ActivityContent from "../fragments/ActivityContent";
import ActivityMenu, { ActivityMenuItem } from "../fragments/ActivityMenu";

interface ActivityPanel {
  key: string;
  content: ReactNode;
}

interface ActivityLayoutProps {
  left: ReactNode;
  activeKey: string | null;
  setActiveKey: React.Dispatch<React.SetStateAction<string | null>>;
  panels: ActivityPanel[];
  isCollapsed?: boolean;
  menuItems: (Omit<ActivityMenuItem, "isOpen" | "onToggle"> & {
    key: string;
  })[];
}

export default function ActivityLayout({
  left,
  activeKey,
  setActiveKey,
  panels,
  isCollapsed = false,
  menuItems,
}: ActivityLayoutProps) {
  return (
    <div className="flex items-start">
      {/* Left Section */}
      <div
        className={`transition-all duration-300 ${
          activeKey ? "lg:w-[68.5%] w-full" : "w-full"
        }`}
      >
        {left}
      </div>

      {/* Right Drawer */}
      <ActivityContent
        activeKey={activeKey}
        isCollapsed={isCollapsed}
        panels={panels}
      />

      {/* Floating Menu */}
      <ActivityMenu
        items={menuItems.map((item) => ({
          ...item,
          isOpen: activeKey === item.key,
          onToggle: () =>
            setActiveKey((prev) => (prev === item.key ? null : item.key)),
        }))}
      />
    </div>
  );
}
