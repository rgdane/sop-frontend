"use client";

import { Navbar } from "@/components/fragments/Navbar";
import Sidebar from "@/components/fragments/Sidebar";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "@/app/loading";
import { useAuthInitializer } from "@/slice/useAuthInit";
import { usePathname, useRouter } from "next/navigation";
import { usePageTitle } from "@/components/providers/PageTitleProvider";
import {
  DashboardLayoutProvider,
  useDashboardLayout,
} from "@/components/providers/DashboardLayoutProvider";
import { Modal, Result } from "antd";
import Button from "@/components/ui/Button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
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
  const router = useRouter();
  const isPasswordDefault = useSelector(
    (state: RootState) => state.auth.user?.is_password_default
  );
  const isMobile = useIsMobile();
  const hydrated = useAuthInitializer();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(true);

  const pathname = usePathname();
  const { setUseBack } = usePageTitle();

  useEffect(() => {
    const excludedPaths = ["/dashboard/security/rbac/role"];
    const isExcluded = excludedPaths.includes(pathname);
    const isDetailPage = pathname.split("/").length > 4;
    setUseBack(!isExcluded && isDetailPage);
  }, [pathname, setUseBack]);

  if (!hydrated) {
    return <Loading />;
  }

  return (
    <div className="h-screen w-screen flex">
      {isPasswordDefault && (
        <Modal
          open={isPasswordModalOpen}
          closable={true}
          maskClosable={false}
          onCancel={() => setIsPasswordModalOpen(false)}
          footer={[
            <Button
              key="close"
              size="middle"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Tutup
            </Button>,
            <Button
              type="primary"
              key="change-password"
              size="middle"
              onClick={() => {
                router.push("/dashboard/profile/change-password");
                setIsPasswordModalOpen(false);
              }}
            >
              Ubah Password
            </Button>,
          ]}
        >
          <Result
            status={"warning"}
            title="Perhatian!"
            subTitle="Password Anda masih default. Untuk keamanan akun, silakan ubah password Anda."
          />
        </Modal>
      )}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 overflow-auto flex flex-col">
        <Navbar
          isMobile={isMobile}
        />
        <div className="flex-1">
          <Suspense fallback={<Loading />}>
            <div className={`h-full ${padding}`}>{children}</div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
