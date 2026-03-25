import { MenuItemTypes } from "@/types/props/menu.types";
import type { MenuProps } from "antd";

export const convertNavigation = (
  items: MenuItemTypes[]
): MenuProps["items"] => {
  return items.map(({ module, children, ...rest }) => {
    const item: any = { ...rest };

    if (children && children.length > 0) {
      item.children = convertNavigation(children);
    }

    return item;
  });
};
