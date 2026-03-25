"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { MODULES } from "@/constants/modules";

type PermissionsContextType = {
  modules: string;
  isAuthorized: boolean;
  isLoading: boolean;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: React.ReactNode;
  modules?: string;
}

const filterPermission = (
  permissions: Record<string, any>,
  module: string
) => {
  if (!module || module.trim() === "") {
    return true;
  }

  return Object.keys(permissions).includes(module);
};

export const PermissionProvider = ({
  children,
  modules = "",
}: PermissionProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  // 🔽 AMBIL PERMISSIONS DARI REDUX
  const permissions = useSelector(
    (state: any) => state.auth?.permissions
  );

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (modules === MODULES._GENERAL) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        if (!modules || modules.trim() === "") {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        if (!permissions) {
          setIsAuthorized(false);
          setIsLoading(false);
          setTimeout(() => {
            router.push("/forbidden");
          }, 100);
          return;
        }

        const isAllowed = filterPermission(permissions, modules);

        if (!isAllowed) {
          setIsAuthorized(false);
          setIsLoading(false);
          setTimeout(() => {
            router.push("/forbidden");
          }, 100);
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in permission check:", error);
        setIsAuthorized(false);
        setIsLoading(false);
        setTimeout(() => {
          router.push("/forbidden");
        }, 100);
      }
    };

    checkPermissions();
  }, [modules, permissions, router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <PermissionsContext.Provider value={{ modules, isAuthorized, isLoading }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};
