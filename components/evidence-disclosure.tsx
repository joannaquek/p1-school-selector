import type { SourceLink } from "@/lib/types";

type EvidenceDisclosureProps = {
  label?: string;
  description: string;
  source?: SourceLink;
};

export function EvidenceDisclosure({
  label = "How calculated",
  description,
  source
}: EvidenceDisclosureProps) {
  return (
    <details className="evidenceDisclosure">
      <summary>{label}</summary>
      <p>{description}</p>
      {source ? (
        <p className="evidenceSource">
          Source:{" "}
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.label}
          </a>{" "}
          ({source.lastUpdated})
        </p>
      ) : (
        <p className="evidenceSource evidenceSource--missing">
          Source unavailable for this metric. Review source mapping.
        </p>
      )}
    </details>
  );
}
