import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { PageSection } from "@/components/ui/PageSection";
import { MODULES } from "@/constants/modules";
import TitleList from "@/features/title/components/TitleList";

const Pages = () => {
  return (
      <PageSection title="Jabatan">
        <TitleList />
      </PageSection>
  );
};

export default Pages;
