"use client";
import { Tooltip } from "antd";
import Button from "@/components/ui/Button";
import { ReactNode } from "react";

export interface ActivityMenuItem {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

interface ActivityMenuProps {
  items: ActivityMenuItem[];
}

export default function ActivityMenu({ items }: ActivityMenuProps) {
  return (
    <div className="fixed flex flex-col gap-y-2 top-17 right-0 h-screen bg-white dark:bg-[#242424] border-l border-t border-black/10 dark:border-white/10 px-2 py-6 z-[1000]">
      {items.map((item, index) => (
        <Tooltip key={index} title={item.title} placement="left">
          <Button icon={item.icon} onClick={item.onToggle} />
        </Tooltip>
      ))}
    </div>
  );
}
