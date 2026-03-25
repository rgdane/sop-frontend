"use client";

import { MODULES } from "@/constants/modules";
import { ButtonProps } from "@/types/props/button.types";
import "@ant-design/v5-patch-for-react-19";
import { Button as ButtonAntd } from "antd";
import { useLayoutEffect, useState } from "react";
import { usePermissions } from "../providers/PermissionProvider";
import { useFilterRBAC } from "@/hooks/useFilterRBAC";
import { useAuthAction } from "@/features/auth/hook/useAuth";

type Props = ButtonProps & {
  redirectModule?: string;
};

export default function Button(props: Props) {
  const { permission, redirectModule = "", size = "small", ...rest } = props;
  const { modules } = usePermissions();
  const [ready, setReady] = useState(false);
  const { getCurrentPermissions } = useAuthAction();

  const activeModules = redirectModule ? redirectModule : modules;
  const currentPermissions = modules ? getCurrentPermissions(activeModules) : null;

  const checkPermission = (permissionType: string, permissions: any) => {
    switch (permissionType) {
      case "save":
        return permissions?.create || permissions?.update;
      case "view":
        return permissions?.view || permissions?.viewOwn;
      default:
        return permissions?.[permissionType];
    }
  };

  const hasPermission =
    !permission ||
    modules === MODULES._GENERAL ||
    (currentPermissions && checkPermission(permission, currentPermissions));

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  if (!hasPermission) {
    return null;
  }

  if (!ready) {
    return null;
  }

  return <ButtonAntd {...rest} size={size} />;
}
