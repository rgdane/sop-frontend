import type { MenuProps } from "antd";
import { generalGroup } from "./items/general";
import { securityGroup } from "./items/security";
import { masterGroup } from "./items/master";
import { MenuItemTypes } from "@/types/props/menu.types";
import { filterMenuByPermission } from "@/lib/filterMenuPermissions";
import { convertNavigation } from "@/lib/convertNavigation";

type Permissions = Record<string, Record<string, boolean>>;

export const getNavigationItems = (
  permissions: Permissions,
  notificationCount: number = 0
): MenuProps["items"] => {
  const rawItems: MenuItemTypes[] = [
    generalGroup(notificationCount),
    masterGroup,
    securityGroup,
  ];
  const filtered = rawItems
    .map((item) => filterMenuByPermission(item, permissions))
    .filter((item): item is MenuItemTypes => item !== null);

  return convertNavigation(filtered);
};
