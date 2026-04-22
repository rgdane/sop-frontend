export const useFilterRBAC = () => {
  const hasViewOwnOnly = () => false;
  const hasActionPermission = () => true;
  const hasFullPermission = () => true;
  const hasRestorePermission = () => true;

  return {
    currentPermissions: null,
    hasViewOwnOnly,
    hasFullPermission,
    hasRestorePermission,
    hasActionPermission,
  };
};