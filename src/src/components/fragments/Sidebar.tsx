"use client";
import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
} from "react";
import type { MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import Sider from "antd/es/layout/Sider";
import { MenuOutlined } from "@ant-design/icons";
import Button from "../ui/Button";
import { getNavigationItems } from "@/navigation";
import { AppDispatch, RootState } from "@/store";
import "@ant-design/v5-patch-for-react-19";
import { Menu } from "../ui/Menu";
import { useDispatch } from "react-redux";
import { setCollapse } from "@/slice/layoutSlice";
import Image from "next/image";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile?: boolean;
  visible?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  isMobile = false,
  visible = false,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const [ready, setReady] = useState(false);

  const navigationItems = getNavigationItems({}, 0);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", JSON.stringify(next));
      return next;
    });
  }, [setCollapsed]);

  useEffect(() => {
    dispatch(setCollapse(collapsed));
  }, [collapsed, dispatch]);

  const ToggleIcon = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="5" width="16" height="12" rx="2" />
        <line x1="9" y1="5" x2="9" y2="17" />
      </svg>
    );
  };

  const onClick: MenuProps["onClick"] = useCallback(
    (e: any) => {
      router.push(e.key);
    },
    [router]
  );

  const onMobileClick: MenuProps["onClick"] = useCallback(
    (e: any) => {
      onClose && onClose();
      router.push(e.key);
    },
    [onClose, router]
  );

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setCollapsed(JSON.parse(stored));
    }
    setMounted(true);
  }, [setCollapsed]);

  if (!mounted) return null;

  // Drawer mode for mobile
  if (isMobile) {
    return (
      <div>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/40 z-[99] transition-opacity duration-200 ${visible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
            }`}
          onClick={onClose}
        />
        {/* Drawer */}
        <div
          className={`fixed left-0 top-0 h-full w-[80vw] max-w-xs z-[100] bg-white dark:bg-[#242424] border-r dark:border-white/10 border-black/10 shadow-lg transition-transform duration-200 ${visible ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-[64px] px-4">
            <span
              className={`flex items-center gap-x-2 ${collapsed && "hidden"}`}
            >
              <Image
                src={"/favicon.ico"}
                width={30}
                height={30}
                alt="Logo"
                className="relative z-10 "
              />
              <p className="text-[#fc8100] text-lg font-semibold">
                {process.env.NEXT_PUBLIC_APP_NAME}
              </p>
            </span>
            <Button
              size="small"
              onClick={onClose}
              icon={<MenuOutlined />}
              className="text-xl text-black dark:text-white"
            />
          </div>
          {/* Navigation Menu */}
          <div className="h-[calc(100vh-64px)] overflow-auto hide-scrollbar">
            <Menu
              onClick={onMobileClick}
              mode="inline"
              items={navigationItems}
              selectedKeys={path ? [path] : []}
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop Sider
  return (
    <Sider
      collapsed={collapsed}
      trigger={null}
      width={284}
      className="fixed left-0 top-0 h-screen z-50 border-r dark:border-white/10 border-black/10 bg-white dark:bg-[#242424] md:inline hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-[64px] px-4 ">
        <span className={`flex items-center gap-x-2 ${collapsed && "hidden"}`}>
          <Image
            src={"/favicon.ico"}
            width={30}
            height={30}
            alt="Logo"
            className="relative z-10 "
          />
          <p className="text-[#fc8100] text-lg font-semibold">
            {process.env.NEXT_PUBLIC_APP_NAME}
          </p>
        </span>
        <div className={`${collapsed && "w-full text-center"}`}>
          <Button
            size="small"
            onClick={toggleCollapsed}
            icon={<ToggleIcon />}
            className="text-xl text-black dark:text-white"
          />
        </div>
      </div>
      {/* Navigation Menu */}
      <div className="h-[calc(100vh-64px)] overflow-auto hide-scrollbar">
        <Menu
          onClick={onClick}
          mode="inline"
          items={navigationItems}
          selectedKeys={[path]}
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
