import { Dropdown as DropdownAntd, DropDownProps, MenuProps } from "antd";
import { useEffect, useLayoutEffect, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import { MenuItemWithPermission } from "@/types/props/dropdown.types";
import { convertToAntdMenuItems } from "@/lib/convertAntdMenus";

interface CustomDropDownPropsWithPermissions
  extends Omit<DropDownProps, "menu"> {
  menu?: {
    items: MenuItemWithPermission[];
    onClick?: (info: { key: string }) => void;
  };
}

interface CustomDropDownPropsWithStandardItems
  extends Omit<DropDownProps, "menu"> {
  menu?: {
    items: MenuProps["items"];
    onClick?: (info: { key: string }) => void;
  };
}

type CustomDropDownProps =
  | CustomDropDownPropsWithPermissions
  | CustomDropDownPropsWithStandardItems;

function isPermissionBasedMenu(
  items: any[]
): items is MenuItemWithPermission[] {
  return (
    items.length > 0 &&
    items[0] &&
    typeof items[0] === "object" &&
    "permission" in items[0]
  );
}

export default function Dropdown(props: CustomDropDownProps) {
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  const { menu, ...rest } = props;

  return ready ? (
    <DropdownAntd
      {...rest}
      getPopupContainer={(triggerNode) =>
        triggerNode.parentElement || document.body
      }
      {...(menu && {
        menu: {
          onClick: menu.onClick,
          items:
            menu.items &&
            Array.isArray(menu.items) &&
            isPermissionBasedMenu(menu.items)
              ? convertToAntdMenuItems(menu.items)
              : menu.items,
        },
      })}
    />
  ) : null;
}
