export function getDomainUrl(): string | null {
  if (typeof window === "undefined") return null;
  return window.location.origin;
}

export function getFullUrl(path?: string): string | null {
  if (typeof window === "undefined") return null; // ⛔ SSR-safe check

  const origin = window.location.origin;
  const currentPath =
    window.location.pathname + window.location.search + window.location.hash;
  return origin + (path || currentPath);
}

export function getBacklogItemUrl(): string | null {
  return getFullUrl(`/dashboard/scrum/todo/`);
}
