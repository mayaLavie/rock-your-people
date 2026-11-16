/* Module-level guards that must be reset when consent is withdrawn without a reload. */
let lastPageViewPath: string | null = null;

export function getLastPageViewPath(): string | null {
  return lastPageViewPath;
}
export function setLastPageViewPath(path: string | null): void {
  lastPageViewPath = path;
}
export function resetPageViewGuard(): void {
  lastPageViewPath = null;
}
