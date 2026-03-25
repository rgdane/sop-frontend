"use client";

import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import { SpkJobReaderList } from "@/features/spk-job/components/SpkJobReaderList";
import { SpkDetailReader } from "@/features/spk/components/SpkDetailReader";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._SPK_TX}>
      <PageSection title="Detail SPK">
        <SpkDetailReader />
        <SpkJobReaderList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
