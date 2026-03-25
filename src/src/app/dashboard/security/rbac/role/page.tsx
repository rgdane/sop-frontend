"use client";
import RoleList from "@/features/role/components/RoleList";
import { Row } from "antd";
import { UserOutlined, SettingOutlined, HomeOutlined } from "@ant-design/icons";
import RoleUserList from "@/features/role/components/RoleUserList";
import { PageSection } from "@/components/ui/PageSection";
import { PermissionProvider } from "@/components/providers/PermissionProvider";
import { MODULES } from "@/constants/modules";
import { Wrapper } from "@/components/fragments/Wrapper";

const Pages = () => {
  return (
    <PermissionProvider modules={MODULES._ROLE}>
      <PageSection title="Role">
        <div className="min-h-screen ">
          <div className=" px-6 py-8">
            <Row gutter={[24, 24]}>
              <Wrapper
                title="Manajemen Role"
                description="Kelola role "
                icon={<SettingOutlined />}
              >
                <RoleList />
              </Wrapper>

              <Wrapper
                title="Manajemen Hak Akses"
                description="Kelola hak akses"
                icon={<UserOutlined />}
              >
                <RoleUserList />
              </Wrapper>
            </Row>
          </div>
        </div>
      </PageSection>
    </PermissionProvider>
  );
};

export default Pages;
