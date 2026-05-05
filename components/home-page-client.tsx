"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { SchoolResultCard } from "@/components/school-result-card";
import { SearchHeader } from "@/components/search-header";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { haversineKm, type GeoPoint } from "@/lib/geo";
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
import type { SchoolCardData } from "@/lib/types";

type HomePageClientProps = {
  initialSearch: SearchState;
  initialFilters: FilterState;
};

function toggleItem<T extends string>(items: T[], value: T) {
  if (items.includes(value)) return items.filter((item) => item !== value);
  return [...items, value];
}

const HomeMap = dynamic(
  () => import("@/components/home-map").then((module) => module.HomeMap),
  { ssr: false }
);

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
  const [geocodeNotice, setGeocodeNotice] = useState<string>("");

  const geocodeStatus = validateAddress(searchState.address);

  const allDetails = useMemo(() => getAllSchoolDetails(), []);

  const homePoint = useMemo<GeoPoint | null>(() => {
    if (searchState.lat === null || searchState.lng === null) return null;
    return { lat: searchState.lat, lng: searchState.lng };
  }, [searchState.lat, searchState.lng]);

  const cardsWithDistance = useMemo<SchoolCardData[]>(
    () =>
      allDetails.map((detail) => {
        const card = toSchoolCard(detail, filters.year, filters.phase);
        if (
          homePoint &&
          typeof detail.lat === "number" &&
          typeof detail.lng === "number"
        ) {
          return {
            ...card,
            distanceKm: haversineKm(homePoint, { lat: detail.lat, lng: detail.lng })
          };
        }
        return card;
      }),
    [allDetails, filters.phase, filters.year, homePoint]
  );

  const filteredSchools = useMemo(
    () =>
      filterSchools(
        cardsWithDistance,
        filters,
        searchState.schoolQuery,
        homePoint !== null
      ),
    [cardsWithDistance, filters, homePoint, searchState.schoolQuery]
  );

  const detailBySlug = useMemo(
    () => new Map(allDetails.map((school) => [school.slug, school])),
    [allDetails]
  );

  const mapSchools = useMemo(
    () =>
      filteredSchools.map((card) => {
        const detail = detailBySlug.get(card.slug);
        return {
          slug: card.slug,
          name: card.name,
          lat: detail?.lat ?? null,
          lng: detail?.lng ?? null,
          distanceKm: card.distanceKm
        };
      }),
    [detailBySlug, filteredSchools]
  );

  useEffect(() => {
    const params = serializeHomeStateToParams(searchState, filters);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [filters, pathname, router, searchState]);

  useEffect(() => {
    writeCompareSlugsToStorage(compareSlugs);
  }, [compareSlugs]);

  async function handleSubmit() {
    setIsSubmitting(true);
    setGeocodeNotice("");

    const address = searchState.address.trim();
    if (!address) {
      setSearchState((prev) => ({ ...prev, lat: null, lng: null }));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/onemap/search?q=${encodeURIComponent(address)}`);
      const payload = (await response.json()) as
        | { lat: number; lng: number; address: string }
        | { error: string };

      if (!response.ok || !("lat" in payload)) {
        const msg =
          "error" in payload
            ? payload.error
            : "Unable to geocode address. Please refine and retry.";
        setGeocodeNotice(msg);
        setSearchState((prev) => ({ ...prev, lat: null, lng: null }));
        return;
      }

      setSearchState((prev) => ({
        ...prev,
        address: payload.address || prev.address,
        lat: payload.lat,
        lng: payload.lng
      }));
      setGeocodeNotice("Address matched. Distances and map updated.");
      setMobileMapOpen(true);
    } catch {
      setGeocodeNotice("Network error while geocoding address.");
      setSearchState((prev) => ({ ...prev, lat: null, lng: null }));
    } finally {
      setIsSubmitting(false);
    }
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
  if (geocodeNotice) {
    notices.push(geocodeNotice);
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
          setSearchState((prev) => ({
            ...prev,
            address: value,
            lat: value.trim() === prev.address.trim() ? prev.lat : null,
            lng: value.trim() === prev.address.trim() ? prev.lng : null
          }))
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
          <HomeMap schools={mapSchools} homePoint={homePoint} />
          <p id="map-text-equivalent" className="caption">
            Address: {searchState.address || "Not set"} · Phase {filters.phase} · Year{" "}
            {filters.year} · {mapSchools.filter((s) => s.lat !== null).length} mapped
            school(s)
          </p>
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
