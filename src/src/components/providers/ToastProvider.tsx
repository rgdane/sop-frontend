"use client";
import React, { createContext, useContext } from "react";
import { notification } from "antd";

const ToastContext = createContext<ReturnType<
  typeof notification.useNotification
> | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [api, contextHolder] = notification.useNotification({
    placement: "topRight",
    bottom: 50,
    duration: 3,
  });
  const enhancedApi = {
    ...api,
    success: (config: any) => {
      api.success({
        ...config,
        description: config.description,
        showProgress: true,
        pauseOnHover: false,
      });
    },
    error: (config: any) => {
      api.error({
        ...config,
        description:
          config.description || "Terjadi kesalahan, silakan coba lagi",
        showProgress: true,
        pauseOnHover: false,
      });
    },
    info: (config: any) => {
      api.info({
        ...config,
        description: config.description || "Informasi sistem",
        showProgress: true,
        pauseOnHover: false,
      });
    },
    warning: (config: any) => {
      api.warning({
        ...config,
        description: config.description || "Peringatan sistem",
        showProgress: true,
        pauseOnHover: false,
      });
    },
  };

  return (
    <ToastContext.Provider value={[enhancedApi, contextHolder]}>
      {contextHolder}
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
