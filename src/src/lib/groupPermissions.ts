export function groupPermissions(
  permissions: string[]
): Record<string, Record<string, boolean>> {
  const grouped: Record<string, Record<string, boolean>> = {};

  permissions.forEach((perm) => {
    const [module, action] = perm.split(".");
    if (!module || !action) return;

    if (!grouped[module]) {
      grouped[module] = {};
    }

    grouped[module][action] = true;
  });

  return grouped;
}
