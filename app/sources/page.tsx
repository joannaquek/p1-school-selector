import { SourceCatalogList } from "@/components/source-catalog-list";
import { TopNav } from "@/components/top-nav";
import { SectionHeader } from "@/components/ui/section-header";
import {
  contextualReferenceSources,
  officialSources
} from "@/lib/source-catalog";

export default function SourcesPage() {
  return (
    <>
      <TopNav />
      <main id="main-content" className="container detailLayout" tabIndex={-1}>
        <section>
          <SectionHeader
            title="Sources"
            subtitle="Official-source-only metrics for MVP. Every displayed metric maps to a source and update date."
          />
        </section>

        <SourceCatalogList
          title="Official Sources (Primary)"
          subtitle="These sources power school metrics, shortlisting filters, and comparison logic."
          rows={officialSources}
        />

        <SourceCatalogList
          title="Context References"
          subtitle="Used for explanatory context only."
          rows={contextualReferenceSources}
        />
      </main>
    </>
  );
}
