import { HomePageClient } from "@/components/home-page-client";
import { TopNav } from "@/components/top-nav";
import { parseHomeStateFromParams } from "@/lib/url-state-serializer";

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

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const { searchState, filterState } = parseHomeStateFromParams(params);

  return (
    <>
      <TopNav />
      <HomePageClient initialSearch={searchState} initialFilters={filterState} />
    </>
  );
}
