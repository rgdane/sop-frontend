import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import DepartmentList from "@/features/department/components/DepartmentList";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._DEPARTMENT}>
      <PageSection title="Departemen">
        <DepartmentList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
