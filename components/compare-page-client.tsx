"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CompareTable } from "@/components/compare-table";
import { CompareToolbar } from "@/components/compare-toolbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  MAX_COMPARE_SCHOOLS,
  readCompareSlugsFromStorage,
  writeCompareSlugsToStorage
} from "@/lib/compare-state";
import type { SchoolDetailData } from "@/lib/types";

type ComparePageClientProps = {
  initialSlugs: string[];
  initialYear: number;
  initialPhase: "2A" | "2B" | "2C";
  allSchools: SchoolDetailData[];
};

export function ComparePageClient({
  initialSlugs,
  initialYear,
  initialPhase,
  allSchools
}: ComparePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const fallbackSlugs = allSchools.slice(0, 2).map((school) => school.slug);
  const initialValid =
    initialSlugs.length > 0 ? initialSlugs : fallbackSlugs;

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() => {
    if (initialSlugs.length > 0) return initialValid;
    const stored = readCompareSlugsFromStorage().filter((slug) =>
      allSchools.some((school) => school.slug === slug)
    );
    if (stored.length > 0) return stored.slice(0, MAX_COMPARE_SCHOOLS);
    return initialValid;
  });
  const [year, setYear] = useState<number>(initialYear);
  const [phase, setPhase] = useState<"2A" | "2B" | "2C">(initialPhase);
  const [addSlug, setAddSlug] = useState<string>(
    allSchools.find((school) => !initialValid.includes(school.slug))?.slug ??
      allSchools[0]?.slug ??
      ""
  );

  const selectedSchools = useMemo(
    () =>
      selectedSlugs
        .map((slug) => allSchools.find((school) => school.slug === slug))
        .filter((school): school is SchoolDetailData => Boolean(school)),
    [allSchools, selectedSlugs]
  );

  const availableOptions = allSchools
    .filter((school) => !selectedSlugs.includes(school.slug))
    .map((school) => ({ value: school.slug, label: school.name }));

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedSlugs.length > 0) {
      params.set("schools", selectedSlugs.join(","));
    }
    params.set("year", String(year));
    params.set("phase", phase);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    writeCompareSlugsToStorage(selectedSlugs);
  }, [pathname, phase, router, selectedSlugs, year]);

  function addSchool() {
    if (!addSlug) return;
    if (selectedSlugs.includes(addSlug)) return;
    if (selectedSlugs.length >= MAX_COMPARE_SCHOOLS) return;
    setSelectedSlugs((prev) => [...prev, addSlug]);
    setAddSlug(availableOptions[0]?.value ?? "");
  }

  function removeSchool(slug: string) {
    setSelectedSlugs((prev) => prev.filter((item) => item !== slug));
  }

  function swapFirstTwo() {
    if (selectedSlugs.length < 2) return;
    setSelectedSlugs((prev) => [prev[1], prev[0], ...prev.slice(2)]);
  }

  return (
    <div className="compareLayout">
      <CompareToolbar
        availableOptions={availableOptions}
        selectedAddSlug={addSlug}
        onAddSlugChange={setAddSlug}
        onAddSchool={addSchool}
        selectedYear={year}
        onYearChange={setYear}
        selectedPhase={phase}
        onPhaseChange={setPhase}
        onSwapFirstTwo={swapFirstTwo}
        disableAdd={!addSlug || selectedSlugs.length >= MAX_COMPARE_SCHOOLS}
        disableSwap={selectedSlugs.length < 2}
      />

      <Card as="section" aria-live="polite">
        <SectionHeader
          title="Selected Schools"
          subtitle="Remove schools or change sequence before reviewing differences."
        />
        <div className="selectedSchoolsRow">
          {selectedSchools.map((school) => (
            <div key={school.slug} className="selectedSchoolPill">
              <span>{school.name}</span>
              <Button variant="ghost" onClick={() => removeSchool(school.slug)}>
                Remove
              </Button>
            </div>
          ))}
          {selectedSchools.length === 0 ? (
            <p className="caption" role="status">
              No schools selected. Add a school to compare.
            </p>
          ) : null}
        </div>
      </Card>

      {selectedSchools.length > 0 ? (
        <CompareTable schools={selectedSchools} year={year} phase={phase} />
      ) : null}

      <div className="compareMobileBar">
        <Button variant="secondary" onClick={swapFirstTwo} disabled={selectedSlugs.length < 2}>
          Swap first two
        </Button>
        <Link className="uiButton uiButton--primary" href="/">
          Back to search
        </Link>
      </div>
    </div>
  );
}
