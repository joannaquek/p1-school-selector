import type { PhaseFilter } from "@/lib/filter-state";
import { ballotingPressureFromRatio } from "@/lib/balloting-pressure";
import type { SchoolCardData, SchoolDetailData } from "@/lib/types";
import bundled from "@/lib/schools-bundled.json";

const allDetails = bundled as SchoolDetailData[];

const detailBySlug = new Map<string, SchoolDetailData>(
  allDetails.map((school) => [school.slug, school])
);

export function getAllSchoolDetails(): SchoolDetailData[] {
  return allDetails;
}

export function getSchoolDetailBySlug(slug: string): SchoolDetailData | undefined {
  return detailBySlug.get(slug);
}

export function toSchoolCard(
  detail: SchoolDetailData,
  year: number,
  phase: PhaseFilter
): SchoolCardData {
  const rec = detail.ballotingHistory.find((h) => h.year === year && h.phase === phase);
  const pressure =
    rec && rec.vacancies > 0
      ? ballotingPressureFromRatio(rec.applicants, rec.vacancies)
      : detail.ballotingPressure;

  return {
    slug: detail.slug,
    name: detail.name,
    address: detail.address,
    postalCode: detail.postalCode,
    distanceKm: detail.distanceKm,
    ballotingPressure: pressure,
    intakeDirection: detail.intakeDirection,
    intakeDelta: detail.intakeDelta,
    ccas: detail.ccas,
    programmes: detail.programmes,
    affiliation: detail.affiliation
  };
}
