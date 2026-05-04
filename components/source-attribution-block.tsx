import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import type { SourceLink } from "@/lib/types";

const metricSourceRules: Array<{ metric: string; keyword: string }> = [
  { metric: "Distance and school profile", keyword: "general" },
  { metric: "Balloting pressure and trends", keyword: "balloting" },
  { metric: "Intake change indicator", keyword: "intake" },
  { metric: "Affiliation pathway", keyword: "general" }
];

export function SourceAttributionBlock({ sources }: { sources: SourceLink[] }) {
  const metricRows = metricSourceRules.map((rule) => ({
    metric: rule.metric,
    source: sources.find((item) =>
      item.label.toLowerCase().includes(rule.keyword)
    )
  }));

  return (
    <Card as="section">
      <SectionHeader
        title="Sources and Data Freshness"
        subtitle="Every metric shown here is linked to its source and update date."
      />
      <ul className="sourcesList">
        {metricRows.map((row) => (
          <li key={row.metric}>
            <p className="sourcesMetricTitle">{row.metric}</p>
            {row.source ? (
              <>
                <a href={row.source.url} target="_blank" rel="noreferrer">
                  {row.source.label}
                </a>
                <span>Last updated: {row.source.lastUpdated}</span>
              </>
            ) : (
              <span className="sourcesMissing">
                Source unavailable for this metric. Check data pipeline mapping.
              </span>
            )}
          </li>
        ))}

        {sources.map((source) => (
          <li key={`${source.url}-raw`}>
            <p className="sourcesMetricTitle">Additional source</p>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.label}
            </a>
            <span>Last updated: {source.lastUpdated}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
