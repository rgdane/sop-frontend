"use client";

import { AntdProvider } from "@/components/providers/AntdProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { CookiesProvider } from "react-cookie";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { BreadcrumbProvider } from "../providers/BreadcrumbProvider";
import { PageTitleProvider } from "@/components/providers/PageTitleProvider";
import { PermissionProvider } from "../providers/PermissionProvider";
import { NavbarProvider } from "../providers/NavbarProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <ReduxProvider>
      <CookiesProvider>
        <AntdProvider>
          <PermissionProvider>
            <ToastProvider>
              <QueryClientProvider client={queryClient}>
                <PageTitleProvider>
                  <NavbarProvider>
                      <BreadcrumbProvider>{children}</BreadcrumbProvider>
                  </NavbarProvider>
                </PageTitleProvider>
              </QueryClientProvider>
            </ToastProvider>
          </PermissionProvider>
        </AntdProvider>
      </CookiesProvider>
    </ReduxProvider>
  );
}
