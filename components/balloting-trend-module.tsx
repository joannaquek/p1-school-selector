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
            {rows.map((row) => (
              <tr key={`${row.year}-${row.phase}`}>
                <td>{row.year}</td>
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
            ))}
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
