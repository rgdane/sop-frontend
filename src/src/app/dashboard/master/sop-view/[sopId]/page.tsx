"use client";

import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import { SopJobReaderList } from "@/features/sop-job/components/SopJobReaderList";
import { SopDetailReader } from "@/features/sop/components/SopDetailReader";

const Pages = () => {
  return (
      <PageSection title="Detail SOP">
        <SopDetailReader />
        <SopJobReaderList />
      </PageSection>
  );
};

export default Pages;
