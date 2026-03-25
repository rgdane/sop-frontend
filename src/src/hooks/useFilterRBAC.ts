import { usePermissions } from "@/components/providers/PermissionProvider";
import { useAuthAction } from "@/features/auth/hook/useAuth";

export const useFilterRBAC = () => {
  const { getCurrentPermissions } = useAuthAction();
  const { modules } = usePermissions();
  const currentPermissions = modules ? getCurrentPermissions(modules) : null;

  const hasViewOwnOnly = () => {
    return (
      currentPermissions &&
      !currentPermissions.view &&
      currentPermissions.viewOwn
    );
  };

  const hasActionPermission = () => {
    if (!currentPermissions) return false;
    return (
      currentPermissions.create === true ||
      currentPermissions.update === true ||
      currentPermissions.delete === true
    );
  };

  const hasFullPermission = (action: string) => {
    return currentPermissions?.[action] === true;
  };

  const hasRestorePermission = () => {
    return currentPermissions?.update === true;
  };

  return {
    currentPermissions,
    hasViewOwnOnly,
    hasFullPermission,
    hasRestorePermission,
    hasActionPermission,
  };
};
