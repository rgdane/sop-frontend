import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import UserList from "@/features/user/components/UserList";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._USER}>
      <PageSection title="Karyawan">
        <UserList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
