import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import DivisionGraphList from "@/features/division/components/DivisionGraphList";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._GENERAL}>
      <PageSection title="Divisi">
        <DivisionGraphList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
