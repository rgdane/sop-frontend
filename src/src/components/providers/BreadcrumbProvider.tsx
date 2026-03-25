"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type BreadcrumbMap = Record<string, string>;
export type BreadcrumbLoadingMap = Record<string, boolean>;

interface BreadcrumbContextType {
  segments: { href: string; segment: string; key: string }[];
  labelMap: BreadcrumbMap;
  loadingMap: BreadcrumbLoadingMap;
  setLabel: (key: string, label: string) => void;
  setLoading: (key: string, isLoading: boolean) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const rawSegments = pathname.split("/").filter((s) => s);

  // key = href supaya unik
  const segments = rawSegments.map((segment, index, arr) => {
    const href = "/" + arr.slice(0, index + 1).join("/");
    return { href, segment, key: href };
  });

  const initialLabelMap: BreadcrumbMap = {};
  const initialLoadingMap: BreadcrumbLoadingMap = {};

  segments.forEach(({ key, segment }) => {
    initialLoadingMap[key] = /^\d+$/.test(segment);
  });

  const [labelMap, setLabelMap] = useState(initialLabelMap);
  const [loadingMap, setLoadingMap] = useState(initialLoadingMap);

  const setLabel = useCallback((key: string, label: string) => {
    setLabelMap((prev) => ({ ...prev, [key]: label }));
    setLoadingMap((prev) => ({ ...prev, [key]: false }));
  }, []);

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingMap((prev) => ({ ...prev, [key]: isLoading }));
  }, []);

  return (
    <BreadcrumbContext.Provider
      value={{ segments, labelMap, loadingMap, setLabel, setLoading }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return context;
};
