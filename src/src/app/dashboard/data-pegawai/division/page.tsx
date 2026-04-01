import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import DivisionList from "@/features/division/components/DivisionList";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._GENERAL}>
      <PageSection title="Divisi">
        <DivisionList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
