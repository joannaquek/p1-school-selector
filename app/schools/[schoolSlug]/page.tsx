import { notFound } from "next/navigation";
import { AffiliationPathwayCard } from "@/components/affiliation-pathway-card";
import { BallotingTrendModule } from "@/components/balloting-trend-module";
import { CcaProgrammeSection } from "@/components/cca-programme-section";
import { SchoolSnapshotHeader } from "@/components/school-snapshot-header";
import { SourceAttributionBlock } from "@/components/source-attribution-block";
import { TopNav } from "@/components/top-nav";
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
  searchParams: Promise<{ year?: string; phase?: string }>;
}) {
  const { schoolSlug } = await params;
  const query = await searchParams;
  const school = getSchoolDetailBySlug(schoolSlug);
  const year = Number(query.year) || 2025;
  const phase = parsePhase(query.phase);

  if (!school) {
    notFound();
  }

  const ballotingSource = school.sourceLinks.find(
    (source) =>
      source.label.toLowerCase().includes("balloting") ||
      source.label.toLowerCase().includes("ballot history")
  );

  return (
    <>
      <TopNav />
      <main id="main-content" className="container detailLayout" tabIndex={-1}>
        <SchoolSnapshotHeader school={school} year={year} phase={phase} />
        <BallotingTrendModule
          rows={school.ballotingHistory}
          source={ballotingSource}
        />
        <CcaProgrammeSection
          ccas={school.ccas}
          programmes={school.distinctiveProgrammes}
          subjects={school.subjects}
        />
        <AffiliationPathwayCard
          affiliation={school.affiliation}
          notes={school.affiliationNotes}
        />
        <SourceAttributionBlock sources={school.sourceLinks} />
      </main>
    </>
  );
}
