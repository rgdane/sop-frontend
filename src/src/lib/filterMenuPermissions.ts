import { MenuItemTypes } from "@/types/props/menu.types";
import { MODULES } from "@/constants/modules";
type Permissions = Record<string, Record<string, boolean>>;

/**
 * Filter menu berdasarkan modul permission. Jika modul tersedia dalam permission object, menu ditampilkan.
 */
export const filterMenuByPermission = (
  menu: MenuItemTypes,
  permissions: Permissions
): MenuItemTypes | null => {
  if (!menu) return null;

  // Jika punya children, filter dulu childnya
  if (menu.children && Array.isArray(menu.children)) {
    const filteredChildren = menu.children
      .map((child) => filterMenuByPermission(child, permissions))
      .filter((child): child is MenuItemTypes => child !== null);

    if (filteredChildren.length === 0) return null;

    return {
      ...menu,
      children: filteredChildren,
    };
  }

  // Jika tidak punya permission, tampilkan
  if (!menu.module) return menu;

  // Bypass kalau module = _GENERAL
  if (menu.module === MODULES._GENERAL) {
    return menu;
  }

  // Jika permission tersedia (misal: "user", "leave", "squad")
  const hasAccess = permissions[menu.module];
  return hasAccess ? menu : null;
};
