import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import DivisionSqlList from "@/features/division/components/DivisionSqlList";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._GENERAL}>
      <PageSection title="Divisi">
        <DivisionSqlList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
