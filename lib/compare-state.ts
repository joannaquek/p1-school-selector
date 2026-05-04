const STORAGE_KEY = "p1_compare_schools";
export const MAX_COMPARE_SCHOOLS = 5;

export function readCompareSlugsFromStorage() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function writeCompareSlugsToStorage(slugs: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, slugs.join(","));
}

export function addSchoolToCompare(existing: string[], slug: string) {
  if (existing.includes(slug)) {
    return { next: existing, reason: "duplicate" as const };
  }
  if (existing.length >= MAX_COMPARE_SCHOOLS) {
    return { next: existing, reason: "limit" as const };
  }
  return { next: [...existing, slug], reason: "added" as const };
}
