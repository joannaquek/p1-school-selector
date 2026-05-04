"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { SchoolResultCard } from "@/components/school-result-card";
import { SearchHeader } from "@/components/search-header";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import {
  MAX_COMPARE_SCHOOLS,
  addSchoolToCompare,
  readCompareSlugsFromStorage,
  writeCompareSlugsToStorage
} from "@/lib/compare-state";
import type { CcaCategory, FilterState } from "@/lib/filter-state";
import { filterSchools } from "@/lib/filter-state";
import { getAllSchoolDetails, toSchoolCard } from "@/lib/school-data";
import type { SearchState } from "@/lib/search-state";
import { validateAddress } from "@/lib/search-state";
import { serializeHomeStateToParams } from "@/lib/url-state-serializer";

type HomePageClientProps = {
  initialSearch: SearchState;
  initialFilters: FilterState;
};

function toggleItem<T extends string>(items: T[], value: T) {
  if (items.includes(value)) return items.filter((item) => item !== value);
  return [...items, value];
}

export function HomePageClient({ initialSearch, initialFilters }: HomePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchState, setSearchState] = useState<SearchState>(initialSearch);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const [compareSlugs, setCompareSlugs] = useState<string[]>(() =>
    readCompareSlugsFromStorage()
  );
  const [compareNotice, setCompareNotice] = useState<string>("");

  const geocodeStatus = validateAddress(searchState.address);

  const allDetails = useMemo(() => getAllSchoolDetails(), []);

  const filteredSchools = useMemo(
    () =>
      filterSchools(
        allDetails.map((d) => toSchoolCard(d, filters.year, filters.phase)),
        filters,
        searchState.schoolQuery
      ),
    [allDetails, filters, searchState.schoolQuery]
  );

  useEffect(() => {
    const params = serializeHomeStateToParams(searchState, filters);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filters, pathname, router, searchState]);

  useEffect(() => {
    writeCompareSlugsToStorage(compareSlugs);
  }, [compareSlugs]);

  function handleSubmit() {
    setIsSubmitting(true);
    window.setTimeout(() => setIsSubmitting(false), 250);
  }

  function handleAddToCompare(slug: string) {
    const result = addSchoolToCompare(compareSlugs, slug);
    setCompareSlugs(result.next);
    if (result.reason === "duplicate") {
      setCompareNotice("School already in compare list.");
      return;
    }
    if (result.reason === "limit") {
      setCompareNotice(`You can compare up to ${MAX_COMPARE_SCHOOLS} schools.`);
      return;
    }
    setCompareNotice("School added to compare.");
  }

  const notices: string[] = [];
  if (geocodeStatus === "partial") {
    notices.push("Address looks incomplete. Add block/street details for better distance accuracy.");
  }
  if (geocodeStatus === "invalid") {
    notices.push("Address could not be validated. Distances may be inaccurate until corrected.");
  }
  if (filters.year < 2025) {
    notices.push("Using an older reference year. Prefer latest complete year where possible.");
  }
  if (searchState.schoolQuery.trim() && filteredSchools.length === 0) {
    notices.push("No schools matched your school name query and filters.");
  }
  if (compareNotice) {
    notices.push(compareNotice);
  }

  const compareLink = `/compare?schools=${compareSlugs.join(",")}&year=${
    filters.year
  }&phase=${filters.phase}`;

  return (
    <main id="main-content" className="container layout" tabIndex={-1}>
      <SearchHeader
        address={searchState.address}
        schoolQuery={searchState.schoolQuery}
        onAddressChange={(value) =>
          setSearchState((prev) => ({ ...prev, address: value }))
        }
        onSchoolQueryChange={(value) =>
          setSearchState((prev) => ({ ...prev, schoolQuery: value }))
        }
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <div className="mobileTopActions">
        <button
          type="button"
          className="uiButton uiButton--secondary"
          onClick={() => setMobileFiltersOpen(true)}
        >
          Filters
        </button>
        <button
          type="button"
          className="uiButton uiButton--secondary"
          onClick={() => setMobileMapOpen((prev) => !prev)}
        >
          {mobileMapOpen ? "Hide map" : "Show map"}
        </button>
      </div>

      {mobileFiltersOpen ? (
        <div
          className="mobileFilterSheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filters-title"
        >
          <div className="mobileFilterSheetCard">
            <div className="mobileSheetHeader">
              <h2 id="mobile-filters-title">Filters</h2>
              <button
                type="button"
                className="uiButton uiButton--ghost"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Close
              </button>
            </div>
            <FilterPanel
              distanceBand={filters.distanceBand}
              pressure={filters.pressure}
              affiliationOnly={filters.affiliationOnly}
              phase={filters.phase}
              year={filters.year}
              ccas={filters.ccaCategories}
              onDistanceBandChange={(value) =>
                setFilters((prev) => ({ ...prev, distanceBand: value }))
              }
              onPressureChange={(value) =>
                setFilters((prev) => ({ ...prev, pressure: value }))
              }
              onAffiliationOnlyChange={(value) =>
                setFilters((prev) => ({ ...prev, affiliationOnly: value }))
              }
              onPhaseChange={(value) =>
                setFilters((prev) => ({ ...prev, phase: value }))
              }
              onYearChange={(value) =>
                setFilters((prev) => ({ ...prev, year: value }))
              }
              onToggleCca={(value: CcaCategory) =>
                setFilters((prev) => ({
                  ...prev,
                  ccaCategories: toggleItem(prev.ccaCategories, value)
                }))
              }
            />
          </div>
        </div>
      ) : null}

      <section className="bodyGrid">
        <div className="desktopOnly">
          <FilterPanel
            distanceBand={filters.distanceBand}
            pressure={filters.pressure}
            affiliationOnly={filters.affiliationOnly}
            phase={filters.phase}
            year={filters.year}
            ccas={filters.ccaCategories}
            onDistanceBandChange={(value) =>
              setFilters((prev) => ({ ...prev, distanceBand: value }))
            }
            onPressureChange={(value) =>
              setFilters((prev) => ({ ...prev, pressure: value }))
            }
            onAffiliationOnlyChange={(value) =>
              setFilters((prev) => ({ ...prev, affiliationOnly: value }))
            }
            onPhaseChange={(value) =>
              setFilters((prev) => ({ ...prev, phase: value }))
            }
            onYearChange={(value) =>
              setFilters((prev) => ({ ...prev, year: value }))
            }
            onToggleCca={(value: CcaCategory) =>
              setFilters((prev) => ({
                ...prev,
                ccaCategories: toggleItem(prev.ccaCategories, value)
              }))
            }
          />
        </div>

        <div className="resultsColumn">
          <SectionHeader
            title="Schools near your home"
            subtitle={`${filteredSchools.length} school(s) shown · Phase ${filters.phase} · Year ${filters.year}`}
          />
          <div className="resultsActions">
            <Link className="uiButton uiButton--secondary" href={compareLink}>
              Open compare ({compareSlugs.length})
            </Link>
          </div>

          {notices.length > 0 ? (
            <Card as="section" className="noticeCard" aria-live="polite">
              <SectionHeader title="Notices" />
              <ul className="methodList">
                {notices.map((notice) => (
                  <li key={notice}>{notice}</li>
                ))}
              </ul>
            </Card>
          ) : null}

          <div className="resultList">
            {filteredSchools.length > 0 ? (
              filteredSchools.map((school) => (
                <SchoolResultCard
                  key={school.slug}
                  school={school}
                  year={filters.year}
                  phase={filters.phase}
                  onAddToCompare={handleAddToCompare}
                />
              ))
            ) : (
              <Card as="section">
                <SectionHeader
                  title="No results found"
                  subtitle="Try widening distance, removing CCA filters, or searching with fewer words."
                />
              </Card>
            )}
          </div>
        </div>

        <Card
          as="aside"
          className={`mapPanel ${mobileMapOpen ? "mapPanel--open" : "mapPanel--closed"}`}
          aria-label="Map preview"
          aria-describedby="map-text-equivalent"
        >
          <SectionHeader title="Map view" />
          <div className="mapPlaceholder">
            <p>Interactive map placeholder</p>
            <span id="map-text-equivalent">
              Address: {searchState.address || "Not set"} · Phase {filters.phase}
              {" · "}Year {filters.year}
            </span>
          </div>
        </Card>
      </section>

      <div className="mobileCompareBar">
        <p>{compareSlugs.length} selected for compare</p>
        <Link className="uiButton uiButton--primary" href={compareLink}>
          Compare now
        </Link>
      </div>
    </main>
  );
}
