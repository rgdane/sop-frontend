import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import Profile from "@/features/profile/components/Profile";
import { MODULES } from "@/constants/modules";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._GENERAL}>
      <PageSection title="Profil">
        <Profile />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
