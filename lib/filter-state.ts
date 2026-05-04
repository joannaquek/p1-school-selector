import type { SchoolCardData } from "@/lib/types";
import { normalizeQuery } from "@/lib/search-state";

export type DistanceBand = "1" | "2" | "3" | "4";
export type PressureFilter = "all" | "low" | "moderate" | "high";
export type PhaseFilter = "2A" | "2B" | "2C";
export type CcaCategory =
  | "Sports"
  | "Performing Arts"
  | "Uniformed Groups"
  | "Clubs & Societies";

export type FilterState = {
  distanceBand: DistanceBand;
  pressure: PressureFilter;
  affiliationOnly: boolean;
  ccaCategories: CcaCategory[];
  year: number;
  phase: PhaseFilter;
};

const ccaCategoryKeywords: Record<CcaCategory, string[]> = {
  Sports: [
    "football",
    "basketball",
    "volleyball",
    "table tennis",
    "wushu",
    "badminton",
    "swimming"
  ],
  "Performing Arts": ["choir", "dance", "orchestra", "band", "guitar"],
  "Uniformed Groups": ["guides", "scouts", "npcc", "ncc", "uniformed"],
  "Clubs & Societies": ["robotics", "infocomm", "club", "society"]
};

function matchesCcaCategory(
  school: SchoolCardData,
  categories: CcaCategory[]
) {
  if (categories.length === 0) return true;

  const ccasLower = school.ccas.map((cca) => cca.toLowerCase());
  return categories.some((category) =>
    ccaCategoryKeywords[category].some((keyword) =>
      ccasLower.some((schoolCca) => schoolCca.includes(keyword))
    )
  );
}

export function filterSchools(
  schools: SchoolCardData[],
  filters: FilterState,
  schoolQuery: string
) {
  const query = normalizeQuery(schoolQuery);

  return schools.filter((school) => {
    const distanceAllowed =
      filters.distanceBand === "4" ||
      school.distanceKm === null ||
      school.distanceKm <= Number(filters.distanceBand);

    const pressureAllowed =
      filters.pressure === "all" ||
      school.ballotingPressure.toLowerCase() === filters.pressure;

    const affiliationAllowed = !filters.affiliationOnly || Boolean(school.affiliation);

    const queryAllowed =
      !query ||
      school.name.toLowerCase().includes(query) ||
      school.address.toLowerCase().includes(query);

    const ccaAllowed = matchesCcaCategory(school, filters.ccaCategories);

    return (
      distanceAllowed &&
      pressureAllowed &&
      affiliationAllowed &&
      queryAllowed &&
      ccaAllowed
    );
  });
}
