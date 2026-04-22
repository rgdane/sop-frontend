"use client";

import { Navbar } from "@/components/fragments/Navbar";
import Sidebar from "@/components/fragments/Sidebar";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "@/app/loading";
import { usePathname } from "next/navigation";
import { usePageTitle } from "@/components/providers/PageTitleProvider";
import {
  DashboardLayoutProvider,
  useDashboardLayout,
} from "@/components/providers/DashboardLayoutProvider";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardLayoutProvider>
  );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { padding } = useDashboardLayout();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { setUseBack } = usePageTitle();

  useEffect(() => {
    const excludedPaths = ["/dashboard/security/rbac/role"];
    const isExcluded = excludedPaths.includes(pathname);
    const isDetailPage = pathname.split("/").length > 4;
    setUseBack(!isExcluded && isDetailPage);
  }, [pathname, setUseBack]);

  return (
    <div className="h-screen w-screen flex">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 overflow-auto flex flex-col">
        <Navbar isMobile={isMobile} />
        <div className="flex-1">
          <Suspense fallback={<Loading />}>
            <div className={`h-full ${padding}`}>{children}</div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}