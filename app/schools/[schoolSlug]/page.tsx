import { notFound } from "next/navigation";
import { AffiliationPathwayCard } from "@/components/affiliation-pathway-card";
import { BallotingTrendModule } from "@/components/balloting-trend-module";
import { CcaProgrammeSection } from "@/components/cca-programme-section";
import { SchoolSnapshotHeader } from "@/components/school-snapshot-header";
import { SourceAttributionBlock } from "@/components/source-attribution-block";
import { TopNav } from "@/components/top-nav";
import { haversineKm } from "@/lib/geo";
import type { PhaseFilter } from "@/lib/filter-state";
import { getSchoolDetailBySlug } from "@/lib/school-data";

function parsePhase(value?: string): PhaseFilter {
  if (value === "2A" || value === "2B" || value === "2C") return value;
  return "2C";
}

export default async function SchoolDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ schoolSlug: string }>;
  searchParams: Promise<{ year?: string; phase?: string; lat?: string; lng?: string }>;
}) {
  const { schoolSlug } = await params;
  const query = await searchParams;
  const school = getSchoolDetailBySlug(schoolSlug);
  const year = Number(query.year) || 2025;
  const phase = parsePhase(query.phase);
  const homeLat = Number(query.lat);
  const homeLng = Number(query.lng);

  if (!school) {
    notFound();
  }

  const detailSchool =
    Number.isFinite(homeLat) &&
    Number.isFinite(homeLng) &&
    school.lat !== null &&
    school.lng !== null
      ? {
          ...school,
          distanceKm: haversineKm(
            { lat: homeLat, lng: homeLng },
            { lat: school.lat, lng: school.lng }
          )
        }
      : school;

  const ballotingSource = school.sourceLinks.find(
    (source) =>
      source.label.toLowerCase().includes("balloting") ||
      source.label.toLowerCase().includes("ballot history")
  );

  return (
    <>
      <TopNav />
      <main id="main-content" className="container detailLayout" tabIndex={-1}>
        <SchoolSnapshotHeader school={detailSchool} year={year} phase={phase} />
        <BallotingTrendModule
          rows={detailSchool.ballotingHistory}
          source={ballotingSource}
        />
        <CcaProgrammeSection
          ccas={detailSchool.ccas}
          programmes={detailSchool.distinctiveProgrammes}
          subjects={detailSchool.subjects}
        />
        <AffiliationPathwayCard
          affiliation={detailSchool.affiliation}
          notes={detailSchool.affiliationNotes}
        />
        <SourceAttributionBlock sources={detailSchool.sourceLinks} />
      </main>
    </>
  );
}
