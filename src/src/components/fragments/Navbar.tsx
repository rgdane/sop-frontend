"use client";

import { MenuProps, Tooltip, Dropdown } from "antd";
import {
  UserOutlined,
  MenuOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import ThemeSwitch from "./ThemeSwitch";
import Avatar from "../ui/Avatar";
import { useCookies } from "react-cookie";
import { useEffect, useState, useRef } from "react";
import { redirect, useRouter } from "next/navigation";
import { useAuthAction } from "@/features/auth/hook/useAuth";
import { usePageTitle } from "../providers/PageTitleProvider";
import Button from "../ui/Button";
import Loading from "@/app/loading";
import { useNavbar } from "../providers/NavbarProvider";

type NavItem = {
  key: string;
  label: string;
  children?: NavItem[];
};

export const Navbar = ({
  isMobile = false,
  onOpenSidebar,
}: {
  isMobile?: boolean;
  onOpenSidebar?: () => void;
}) => {
  const [cookies] = useCookies(["user"]);
  const [user, setUser] = useState<{ id: any; name?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuthAction();
  const router = useRouter();
  const { title, useBack } = usePageTitle();
  const { content } = useNavbar();

  useEffect(() => {
    setMounted(true);
    try {
      const parsed =
        typeof cookies.user === "string"
          ? JSON.parse(cookies.user)
          : cookies.user;

      const firstName = parsed.name.split(" ")[0].toLowerCase();
      parsed.name = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      setUser(parsed);
    } catch (error) {
      console.warn("Gagal parse user dari cookie:", error);
      setUser(null);
    }
  }, [cookies.user]);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <span>Profil</span>,
      onClick: () => {
        setTimeout(() => {
          redirect("/dashboard/profile");
        }, 10);
      },
    },
    {
      key: "2",
      danger: true,
      label: <span>Logout</span>,
      onClick: () => {
        setIsLoggingOut(true);
        logout();
        setUser(null);
        redirect("/auth/login");
      },
    },
  ];

  const flattenLeafRoutes = (items: NavItem[]): NavItem[] => {
    return items.flatMap((item) => {
      const children = item.children || [];
      const isLeaf = item.key.startsWith("/") && children.length === 0;
      const leaf = isLeaf ? [{ key: item.key, label: item.label }] : [];
      const nested = flattenLeafRoutes(children);
      return [...leaf, ...nested];
    });
  };

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
          <Loading />
        </div>
      )}
      <div className="sticky top-0 right-0 z-[99] bg-white dark:bg-[#1a1a1a] border-b dark:text-white dark:border-white/10 border-black/10 transition-colors dark:border-b w-full flex justify-end px-8 py-4 ">
        <div className="flex items-center justify-between gap-x-4 w-full">
          <div className="flex items-center gap-x-4 min-w-0">
            {isMobile && (
              <Button
                className="mr-2 flex items-center justify-center w-10 h-10 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] md:hidden"
                onClick={onOpenSidebar}
                aria-label="Open sidebar"
                icon={<MenuOutlined />}
              />
            )}
            {useBack && (
              <Tooltip title="Kembali">
                <Button
                  className="mr-2 flex items-center justify-center w-10 h-10 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-[#242424]"
                  onClick={() => router.back()}
                  type="text"
                  icon={<ArrowLeftOutlined />}
                />
              </Tooltip>
            )}
            <div className="text-[18px] font-bold truncate hidden md:block max-w-[17rem]">
              {title}
            </div>
          </div>

          {content &&
            <div className="border-l px-4 border-black/10 dark:border-white/10">{content}</div>
          }

          <div className="flex items-center gap-x-4 ml-auto">
            <ThemeSwitch />
            <Dropdown menu={{ items }} trigger={["click"]}>
              <div className="flex items-center gap-x-2 cursor-pointer select-none">
                <Avatar icon={<UserOutlined />} />
                <span>{mounted ? user?.name ?? "Guest" : ""}</span>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </>
  );
};
