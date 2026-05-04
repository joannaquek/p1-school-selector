import { Card } from "@/components/ui/card";
import { EvidenceDisclosure } from "@/components/evidence-disclosure";
import { SectionHeader } from "@/components/ui/section-header";
import type { SchoolDetailData } from "@/lib/types";
import { CompareMetricRow } from "./compare-metric-row";

type CompareTableProps = {
  schools: SchoolDetailData[];
  year: number;
  phase: "2A" | "2B" | "2C";
};

function intakeText(school: SchoolDetailData) {
  if (school.intakeDirection === "increase") return `+${Math.abs(school.intakeDelta)}`;
  if (school.intakeDirection === "decrease") return `-${Math.abs(school.intakeDelta)}`;
  return "0";
}

function ratioFor(school: SchoolDetailData, year: number, phase: "2A" | "2B" | "2C") {
  const row = school.ballotingHistory.find(
    (record) => record.year === year && record.phase === phase
  );
  if (!row) return "Unavailable for selected year/phase";
  if (!row.vacancies) return "N/A (no vacancies)";
  return `${(row.applicants / row.vacancies).toFixed(2)} (${row.applicants}/${row.vacancies})`;
}

function ballotedFor(school: SchoolDetailData, year: number, phase: "2A" | "2B" | "2C") {
  const row = school.ballotingHistory.find(
    (record) => record.year === year && record.phase === phase
  );
  if (!row) return "Unavailable for selected year/phase";
  return row.balloted ? "Yes" : "No";
}

export function CompareTable({ schools, year, phase }: CompareTableProps) {
  const hasUnavailableYearData = schools.some(
    (school) =>
      !school.ballotingHistory.some(
        (row) => row.year === year && row.phase === phase
      )
  );
  const sourceForDistance = schools[0]?.sourceLinks.find((source) =>
    source.label.toLowerCase().includes("general")
  );
  const sourceForBalloting = schools[0]?.sourceLinks.find(
    (source) =>
      source.label.toLowerCase().includes("balloting") ||
      source.label.toLowerCase().includes("ballot history")
  );
  const sourceForIntake = schools[0]?.sourceLinks.find((source) =>
    source.label.toLowerCase().includes("intake")
  );

  return (
    <Card as="section">
      <SectionHeader
        title="Difference-first Comparison"
        subtitle={`Comparing ${schools.length} schools · Year ${year} · Phase ${phase}`}
      />
      <div className="compareTableWrap">
        <table className="compareTable">
          <caption className="srOnly">
            Comparison table showing distance, pressure, phase outcomes, intake,
            CCA, affiliation, and sources for selected schools.
          </caption>
          <thead>
            <tr>
              <th>Metric</th>
              {schools.map((school) => (
                <th key={school.slug}>{school.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <CompareMetricRow
              label="Distance from home"
              values={schools.map((school) =>
                school.distanceKm === null ? "—" : `${school.distanceKm.toFixed(1)} km`
              )}
            />
            <CompareMetricRow
              label="Balloting pressure"
              values={schools.map((school) => school.ballotingPressure)}
            />
            <CompareMetricRow
              label={`Applicant-to-vacancy ratio (${phase})`}
              values={schools.map((school) => ratioFor(school, year, phase))}
            />
            <CompareMetricRow
              label={`Balloted in ${phase}`}
              values={schools.map((school) => ballotedFor(school, year, phase))}
            />
            <CompareMetricRow
              label="Intake change"
              values={schools.map((school) => intakeText(school))}
            />
            <CompareMetricRow
              label="Top CCAs"
              values={schools.map((school) => school.ccas.slice(0, 2).join(", "))}
            />
            <CompareMetricRow
              label="Affiliation pathway"
              values={schools.map(
                (school) => school.affiliation ?? "No official affiliation listed"
              )}
            />
            <CompareMetricRow
              label="Sources"
              values={schools.map((school) =>
                school.sourceLinks
                  .slice(0, 2)
                  .map((source) => source.label)
                  .join(" | ")
              )}
            />
          </tbody>
        </table>
      </div>
      {hasUnavailableYearData ? (
        <p className="caption">
          Some schools do not have records for Year {year}, Phase {phase}.
          Switch year/phase to view available data.
        </p>
      ) : null}
      <div className="compareDisclosures">
        <EvidenceDisclosure
          description="Distance uses address-to-school coordinate calculations and may vary with geocode precision."
          source={sourceForDistance}
        />
        <EvidenceDisclosure
          description="Applicant/vacancy and balloted status are drawn from historical MOE phase data."
          source={sourceForBalloting}
        />
        <EvidenceDisclosure
          description="Intake change compares the latest cycle's announced capacity against the prior cycle."
          source={sourceForIntake}
        />
      </div>
    </Card>
  );
}
