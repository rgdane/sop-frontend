import { MODULES } from "@/constants/modules";
import { MenuItemTypes } from "@/types/props/menu.types";
import { AppstoreOutlined } from "@ant-design/icons";
import { MdOutlineDesignServices } from "react-icons/md";

const _PREFIX = "/dashboard/master";

export const masterGroup: MenuItemTypes = {
  key: "master",
  label: "Master",
  type: "group",
  children: [
    {
      key: `${_PREFIX}/data-sop`,
      label: "Data SOP",
      icon: <AppstoreOutlined />,
      children: [
        {
          key: `${_PREFIX}/sop`,
          label: "SOP",
          module: MODULES._SOP,
        },
        {
          key: `${_PREFIX}/spk`,
          label: "SPK",
          module: MODULES._SPK,
        },
      ],
    },
  ],
};
