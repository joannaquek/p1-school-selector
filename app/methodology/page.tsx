import { MethodologySection } from "@/components/methodology-section";
import { TopNav } from "@/components/top-nav";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";

export default function MethodologyPage() {
  return (
    <>
      <TopNav />
      <main id="main-content" className="container detailLayout" tabIndex={-1}>
        <section>
          <SectionHeader
            title="Methodology"
            subtitle="How metrics are calculated and presented for transparent parent decision support."
          />
        </section>

        <MethodologySection
          title="Metric Definitions"
          items={[
            "Distance from home: computed from provided address coordinates to school coordinates.",
            "Balloting pressure: qualitative bucket derived from applicant-to-vacancy ratios in historical phase data.",
            "Intake change: latest cycle seat increase/decrease compared with prior cycle where available.",
            "Fit indicators: CCA/programmes/subjects shown as discovery aids, not guaranteed pathways.",
            "Affiliation pathway: shown only when available in official source set for MVP."
          ]}
        />

        <MethodologySection
          title="Join and Matching Rules"
          subtitle="Used to combine records across official datasets."
          items={[
            "Canonical school key uses normalized school names and stable slug mapping.",
            "Normalization removes punctuation variance and standardizes spacing/casing.",
            "Ambiguous matches are excluded until validated (fail-safe over silent mismatch).",
            "Raw source values are retained for audit and future reprocessing."
          ]}
        />

        <MethodologySection
          title="Caveats"
          subtitle="Important limits for interpretation."
          items={[
            "Historical vacancy and balloting data do not guarantee future admission outcomes.",
            "Meeting a historical cutoff or ratio profile does not ensure a place in a given phase.",
            "Affiliation provides priority consideration only under official rules and available vacancies.",
            "Data timeliness varies by source publication schedules."
          ]}
        />

        <Card as="section">
          <SectionHeader
            title="Change Log"
            subtitle="Major methodology and data model updates are logged here."
          />
          <ul className="methodList">
            <li>
              2026-05-03: Initial methodology baseline covering distance, pressure,
              intake, fit, and affiliation lenses.
            </li>
          </ul>
        </Card>
      </main>
    </>
  );
}
