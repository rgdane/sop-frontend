import { MODULES } from "@/constants/modules";
import { MenuItemTypes } from "@/types/props/menu.types";
import {
  BellOutlined,
  HomeOutlined,
  IdcardOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import { FolderSymlink } from "lucide-react";
import { IoDocumentOutline, IoDocumentsOutline } from "react-icons/io5";

const _PREFIX = "/dashboard/data-pegawai";

export const generalGroup = (
  notificationCount: number = 0
): MenuItemTypes => ({
  key: "grp",
  label: "General",
  type: "group",
  children: [
    {
      key: "/dashboard",
      label: "Dashboard",
      module: MODULES._GENERAL,
      icon: <HomeOutlined />,
    },
    {
      key: "/dashboard/data-pegawai",
      label: "Data Pegawai",
      icon: <IdcardOutlined />,
      children: [
        {
          key: `${_PREFIX}/division`,
          module: MODULES._DIVISION,
          label: "Divisi",
        },
        // {
        //   key: `${_PREFIX}/division-sql`,
        //   module: MODULES._DIVISION,
        //   label: "Divisi SQL",
        // },
        // {
        //   key: `${_PREFIX}/division-graph`,
        //   module: MODULES._DIVISION,
        //   label: "Divisi Graph",
        // },
        {
          key: `${_PREFIX}/title`,
          module: MODULES._TITLE,
          label: "Jabatan",
        },
        {
          key: `${_PREFIX}/user`,
          module: MODULES._USER,
          label: "Karyawan",
        },
      ],
    }
  ],
});
