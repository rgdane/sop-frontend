import { MenuItemWithPermission } from "@/types/props/dropdown.types";
import { MenuProps } from "antd";

export const convertToAntdMenuItems = (
  items: MenuItemWithPermission[]
): MenuProps["items"] => {
  return items.map((item, index) => {
    const { permission, children, type, key, ...rest } = item;

    if (type === "divider" || type === "group") {
      return {
        type,
        ...rest,
      };
    }

    const converted: any = {
      key: key ?? `auto-key-${index}`,
      ...rest,
    };

    if (children && children.length > 0) {
      converted.children = convertToAntdMenuItems(children);
    }

    return converted;
  });
};
