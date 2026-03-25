import { MODULES } from "@/constants/modules";
import { MenuItemTypes } from "@/types/props/menu.types";
import { LockOutlined } from "@ant-design/icons";

const _PREFIX = "/dashboard/security";

export const securityGroup: MenuItemTypes = {
  key: "security",
  label: "Security",
  type: "group",
  children: [
    {
      key: `${_PREFIX}/rbac`,
      label: "Hak Akses",
      icon: <LockOutlined />,
      children: [
        {
          key: `${_PREFIX}/rbac/role`,
          module: MODULES._ROLE,
          label: "Role",
        },
        {
          key: `${_PREFIX}/rbac/permission`,
          module: MODULES._PERMISSION,
          label: "Permission",
        },
      ],
    },
  ],
};
