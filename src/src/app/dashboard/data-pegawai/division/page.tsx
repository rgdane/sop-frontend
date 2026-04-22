import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import DivisionList from "@/features/division/components/DivisionList";

const Pages = () => {
  return (
      <PageSection title="Divisi">
        <DivisionList />
      </PageSection>
  );
};

export default Pages;
