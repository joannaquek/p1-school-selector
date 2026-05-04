import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

type AffiliationPathwayCardProps = {
  affiliation: string | null;
  notes: string;
};

export function AffiliationPathwayCard({
  affiliation,
  notes
}: AffiliationPathwayCardProps) {
  return (
    <Card as="section">
      <SectionHeader
        title="Affiliation Pathway"
        subtitle="Affiliation can provide priority consideration, subject to official rules and vacancies."
      />
      <p className="affiliationPrimary">
        {affiliation ?? "No official affiliation listed for this primary school."}
      </p>
      <p className="affiliationNotes">{notes}</p>
    </Card>
  );
}
