import { ActionPermissions } from "./action_permission.types";

export interface MenuItemWithPermission {
  key?: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  permission?: ActionPermissions;
  onClick?: () => void;
  children?: MenuItemWithPermission[];
  type?: string;
}
