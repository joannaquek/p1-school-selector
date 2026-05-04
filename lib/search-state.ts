export type GeocodeStatus = "idle" | "valid" | "invalid" | "partial";

export type SearchState = {
  address: string;
  schoolQuery: string;
  lat: number | null;
  lng: number | null;
};

export function validateAddress(address: string): GeocodeStatus {
  const trimmed = address.trim();
  if (!trimmed) return "idle";
  if (trimmed.length < 6) return "partial";
  if (!/\d/.test(trimmed)) return "invalid";
  return "valid";
}

export function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}
