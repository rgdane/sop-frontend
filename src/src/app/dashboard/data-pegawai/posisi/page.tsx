import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import PositionList from "@/features/position/components/PositionList";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._POSITION}>
      <PageSection title="Posisi">
        <PositionList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
