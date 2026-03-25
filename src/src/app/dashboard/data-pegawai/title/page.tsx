import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import TitleList from "@/features/title/components/TitleList";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._TITLE}>
      <PageSection title="Jabatan">
        <TitleList />
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
