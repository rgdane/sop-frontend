import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import SpkList from "@/features/spk/components/SpkList";

const Pages = () => {
  return (
      <PageSection title="SPK">
        <SpkList />
      </PageSection>
  );
};

export default Pages;
