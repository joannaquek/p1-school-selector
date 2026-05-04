import type {
  CcaCategory,
  DistanceBand,
  FilterState,
  PhaseFilter,
  PressureFilter
} from "@/lib/filter-state";
import type { SearchState } from "@/lib/search-state";

type HomeSearchParams = {
  address?: string;
  school?: string;
  distanceBand?: string;
  pressure?: string;
  affiliation?: string;
  cca?: string;
  year?: string;
  phase?: string;
  lat?: string;
  lng?: string;
};

const validDistanceBands: DistanceBand[] = ["1", "2", "3", "4"];
const validPressure: PressureFilter[] = ["all", "low", "moderate", "high"];
const validPhases: PhaseFilter[] = ["2A", "2B", "2C"];
const validCcaCategories: CcaCategory[] = [
  "Sports",
  "Performing Arts",
  "Uniformed Groups",
  "Clubs & Societies"
];

export function parseHomeStateFromParams(params: HomeSearchParams) {
  const distanceBand = validDistanceBands.includes(
    params.distanceBand as DistanceBand
  )
    ? (params.distanceBand as DistanceBand)
    : "3";

  const pressure = validPressure.includes(params.pressure as PressureFilter)
    ? (params.pressure as PressureFilter)
    : "all";

  const phase = validPhases.includes(params.phase as PhaseFilter)
    ? (params.phase as PhaseFilter)
    : "2C";

  const parsedYear = Number(params.year);
  const year = Number.isFinite(parsedYear) ? parsedYear : 2025;

  const ccas = (params.cca ?? "")
    .split(",")
    .map((item) => decodeURIComponent(item).trim())
    .filter((item): item is CcaCategory =>
      validCcaCategories.includes(item as CcaCategory)
    );

  const parsedLat = Number(params.lat);
  const parsedLng = Number(params.lng);

  const searchState: SearchState = {
    address: params.address ?? "",
    schoolQuery: params.school ?? "",
    lat: Number.isFinite(parsedLat) ? parsedLat : null,
    lng: Number.isFinite(parsedLng) ? parsedLng : null
  };

  const filterState: FilterState = {
    distanceBand,
    pressure,
    affiliationOnly: params.affiliation === "1",
    ccaCategories: ccas,
    year,
    phase
  };

  return { searchState, filterState };
}

export function serializeHomeStateToParams(
  searchState: SearchState,
  filterState: FilterState
) {
  const params = new URLSearchParams();
  if (searchState.address.trim()) params.set("address", searchState.address.trim());
  if (searchState.schoolQuery.trim())
    params.set("school", searchState.schoolQuery.trim());

  params.set("distanceBand", filterState.distanceBand);
  params.set("pressure", filterState.pressure);
  if (filterState.affiliationOnly) params.set("affiliation", "1");
  if (filterState.ccaCategories.length > 0) {
    params.set("cca", filterState.ccaCategories.join(","));
  }
  params.set("year", String(filterState.year));
  params.set("phase", filterState.phase);
  if (searchState.lat !== null) params.set("lat", String(searchState.lat));
  if (searchState.lng !== null) params.set("lng", String(searchState.lng));
  return params;
}
