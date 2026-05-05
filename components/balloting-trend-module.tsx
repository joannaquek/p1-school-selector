import { Card } from "@/components/ui/card";
import { EvidenceDisclosure } from "@/components/evidence-disclosure";
import { SectionHeader } from "@/components/ui/section-header";
import type { BallotingPhaseRecord, SourceLink } from "@/lib/types";

function ratio(record: BallotingPhaseRecord) {
  if (!record.vacancies) return "N/A";
  return Number((record.applicants / record.vacancies).toFixed(2));
}

export function BallotingTrendModule({
  rows,
  source
}: {
  rows: BallotingPhaseRecord[];
  source?: SourceLink;
}) {
  const rowsByYear = rows.reduce<Record<number, BallotingPhaseRecord[]>>((acc, row) => {
    if (!acc[row.year]) acc[row.year] = [];
    acc[row.year].push(row);
    return acc;
  }, {});

  const orderedYears = Object.keys(rowsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const phaseOrder: Record<BallotingPhaseRecord["phase"], number> = {
    "2A": 1,
    "2B": 2,
    "2C": 3
  };

  return (
    <Card as="section">
      <SectionHeader
        title="Balloting and Vacancies Trend"
        subtitle="Historical context by phase. Past results do not guarantee admission."
      />
      <div className="trendTableWrap">
        <table className="trendTable">
          <caption className="srOnly">
            Historical vacancies, applicants, ratio, and balloting outcomes by
            year and phase.
          </caption>
          <thead>
            <tr>
              <th>Year</th>
              <th>Phase</th>
              <th>Vacancies</th>
              <th>Applicants</th>
              <th>Ratio</th>
              <th>Balloted</th>
            </tr>
          </thead>
          <tbody>
            {orderedYears.flatMap((year) => {
              const yearRows = [...rowsByYear[year]].sort(
                (a, b) => phaseOrder[a.phase] - phaseOrder[b.phase]
              );

              return yearRows.map((row, idx) => (
                <tr key={`${row.year}-${row.phase}`}>
                  {idx === 0 ? (
                    <th rowSpan={yearRows.length} className="trendYearCell">
                      {year}
                    </th>
                  ) : null}
                  <td>{row.phase}</td>
                  <td>{row.vacancies}</td>
                  <td>{row.applicants}</td>
                  <td>{ratio(row)}</td>
                  <td>
                    <span className={`pill ${row.balloted ? "decrease" : "increase"}`}>
                      {row.balloted ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
      <EvidenceDisclosure
        description="Applicant-to-vacancy ratios and balloting outcomes are compiled from the cited sources (official MOE data where available; otherwise clearly labelled third-party aggregations)."
        source={source}
      />
    </Card>
  );
}
