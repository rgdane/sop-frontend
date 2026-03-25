"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout } from "antd";
import { Menu } from "@/components/ui/Menu";
import Button from "@/components/ui/Button";
import type { MenuProps } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";

const { Sider } = Layout;

interface NestedSidebarProps {
  title?: string;
  menuItems: MenuProps["items"];
  storageKey?: string;
  defaultCollapsed?: boolean;
  width?: number;
  collapsedWidth?: number;
  selectedKeys?: string[];
  usePathnameSelection?: boolean;
  disableToggle?: boolean;
}

export default function NestedSidebar({
  title = "Menu",
  menuItems,
  storageKey = "nested-sidebar-collapsed",
  defaultCollapsed = true,
  width = 284,
  collapsedWidth = 80,
  selectedKeys = [],
  usePathnameSelection = true,
  disableToggle = false,
}: NestedSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    if (disableToggle) return; // skip restore state
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      setCollapsed(JSON.parse(stored));
    }
  }, [storageKey]);

  const toggleCollapsed = () => {
    if (disableToggle) return; // prevent toggle
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  // Fungsi untuk menghandle onClick dari menu item
  const handleMenuClick: MenuProps["onClick"] = (e: any) => {
    // Cari menu item yang diklik
    const findMenuItem = (items: MenuProps["items"], key: string): any => {
      if (!items) return null;

      for (const item of items) {
        if (item && "key" in item) {
          if (item.key === key) return item;

          // Cek children jika ada
          if ("children" in item && item.children) {
            const found = findMenuItem(item.children, key);
            if (found) return found;
          }
        }
      }
      return null;
    };

    const clickedItem = findMenuItem(menuItems, e.key);

    // Jika item memiliki onClick custom, jalankan itu
    if (clickedItem && typeof clickedItem.onClick === "function") {
      clickedItem.onClick(e);
    }
    // Jika tidak, default ke router.push dengan key sebagai path
    else if (e.key && e.key.startsWith("/")) {
      router.push(e.key);
    }
  };

  // Tentukan selectedKeys berdasarkan mode
  const finalSelectedKeys = usePathnameSelection ? [pathname] : selectedKeys;

  return (
    <Sider
      collapsed={collapsed}
      trigger={null}
      width={width}
      collapsedWidth={collapsedWidth}
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
      className="border-r dark:border-white/10 border-black/10 bg-white dark:bg-[#242424]"
    >
      {/* Header */}
      {!disableToggle && (
        <div className="flex items-center justify-between px-4 py-4 border-b dark:border-white/10 border-black/10">
          {!collapsed && (
            <div className="font-semibold text-lg truncate">{title}</div>
          )}
          <div className={`${collapsed && "w-full text-center"}`}>
            <Button
              size="small"
              type="text"
              onClick={toggleCollapsed}
              icon={
                collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
              }
              className="text-xl text-black dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="h-[calc(100vh-64px)] overflow-auto hide-scrollbar pt-4">
        <Menu
          onClick={handleMenuClick}
          mode="inline"
          items={menuItems}
          selectedKeys={finalSelectedKeys}
        />
      </div>
    </Sider>
  );
}
