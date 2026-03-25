export function checkPermission(
  currentPermissions: string[] | Record<string, boolean> | null | undefined,
  permission: string
): boolean {
  if (!currentPermissions) return false;

  if (Array.isArray(currentPermissions)) {
    return currentPermissions.includes(permission);
  }

  return !!currentPermissions[permission];
}
