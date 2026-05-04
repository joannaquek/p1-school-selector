import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

type SourceCatalogItem = {
  metric: string;
  source: string;
  url: string;
  updateCadence?: string;
  lastUpdated?: string;
  note?: string;
};

export function SourceCatalogList({
  title,
  subtitle,
  rows
}: {
  title: string;
  subtitle?: string;
  rows: SourceCatalogItem[];
}) {
  return (
    <Card as="section">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="catalogTableWrap">
        <table className="catalogTable">
          <caption className="srOnly">
            Source catalog listing metric mapping, links, cadence, and update
            dates.
          </caption>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Source</th>
              <th>Update cadence</th>
              <th>Last updated</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.metric}-${row.url}`}>
                <td>{row.metric}</td>
                <td>
                  <a href={row.url} target="_blank" rel="noreferrer">
                    {row.source}
                  </a>
                </td>
                <td>{row.updateCadence ?? "N/A"}</td>
                <td>{row.lastUpdated ?? "N/A"}</td>
                <td>{row.note ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
