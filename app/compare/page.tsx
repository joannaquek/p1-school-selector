import { ComparePageClient } from "@/components/compare-page-client";
import { TopNav } from "@/components/top-nav";
import { getAllSchoolDetails } from "@/lib/school-data";

type CompareSearchParams = {
  schools?: string;
  year?: string;
  phase?: string;
};

function parsePhase(phase: string | undefined): "2A" | "2B" | "2C" {
  if (phase === "2A" || phase === "2B" || phase === "2C") return phase;
  return "2C";
}

function parseYear(year: string | undefined): number {
  const parsed = Number(year);
  if (!Number.isFinite(parsed)) return 2025;
  return parsed;
}

export default async function ComparePage({
  searchParams
}: {
  searchParams: Promise<CompareSearchParams>;
}) {
  const params = await searchParams;
  const allSchools = getAllSchoolDetails();
  const validSlugs = new Set(allSchools.map((school) => school.slug));

  const requestedSlugs = (params.schools ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && validSlugs.has(value));

  return (
    <>
      <TopNav />
      <main id="main-content" className="container detailLayout" tabIndex={-1}>
        <ComparePageClient
          initialSlugs={requestedSlugs}
          initialYear={parseYear(params.year)}
          initialPhase={parsePhase(params.phase)}
          allSchools={allSchools}
        />
      </main>
    </>
  );
}
