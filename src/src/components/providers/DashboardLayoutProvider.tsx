"use client";
import { useAuthAction } from "@/features/auth/hook/useAuth";
import { createContext, useContext, useEffect, useState } from "react";

interface DashboardLayoutContextType {
  padding: string;
  setPadding: (val: string) => void;
}

const DashboardLayoutContext = createContext<
  DashboardLayoutContextType | undefined
>(undefined);

export const DashboardLayoutProvider = ({
  children,
  initialPadding = "px-4 sm:px-8 py-4",
}: {
  children: React.ReactNode;
  initialPadding?: string;
}) => {
  const [padding, setPadding] = useState(initialPadding);
  const { getCurrentUser } = useAuthAction();
  const user = getCurrentUser();

  return (
    <DashboardLayoutContext.Provider value={{ padding, setPadding }}>
      {children}
    </DashboardLayoutContext.Provider>
  );
};

export const useDashboardLayout = () => {
  const ctx = useContext(DashboardLayoutContext);
  if (!ctx)
    throw new Error(
      "useDashboardLayout must be used within DashboardLayoutProvider"
    );
  return ctx;
};
