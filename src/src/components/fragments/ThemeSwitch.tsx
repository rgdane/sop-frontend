"use client";
import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { toggleTheme, initializeTheme } from "@/features/themes/themeSlice";

const ThemeSwitch: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");

      if (saved === "dark") {
        dispatch(initializeTheme(true));
      } else if (saved === "light") {
        dispatch(initializeTheme(false));
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        dispatch(initializeTheme(prefersDark));
      }
    }
    setMounted(true);
  }, [dispatch]);

  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    html.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  if (!mounted) return null;

  return (
    <Switch
      checked={isDark}
      onChange={() => dispatch(toggleTheme())}
      checkedChildren={<MoonOutlined />}
      unCheckedChildren={<SunOutlined />}
    />
  );
};

export default ThemeSwitch;
