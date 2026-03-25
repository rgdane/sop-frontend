import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import LevelList from "@/features/level/components/LevelList";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._LEVEL}>
      <PageSection title="Level">
        <LevelList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
