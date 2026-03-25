"use client";

import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import { SopJobReaderList } from "@/features/sop-job/components/SopJobReaderList";
import { SopDetailReader } from "@/features/sop/components/SopDetailReader";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._SOP}>
      <PageSection title="Detail SOP">
        <SopDetailReader />
        <SopJobReaderList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
