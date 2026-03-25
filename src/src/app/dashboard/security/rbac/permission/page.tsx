"use client";
import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import PermissionList from "@/features/permission/components/PermissionList";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._PERMISSION}>
      <PageSection title="Permission">
        <PermissionList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
