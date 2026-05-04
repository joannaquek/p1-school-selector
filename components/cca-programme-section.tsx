import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

type CcaProgrammeSectionProps = {
  ccas: string[];
  programmes: string[];
  subjects: string[];
};

export function CcaProgrammeSection({
  ccas,
  programmes,
  subjects
}: CcaProgrammeSectionProps) {
  return (
    <Card as="section">
      <SectionHeader
        title="Fit: CCA, Programmes, and Subjects"
        subtitle="Use these as fit indicators for interests and development pathways."
      />
      <div className="fitGrid">
        <div>
          <h3>CCA Highlights</h3>
          <ul>
            {ccas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Distinctive Programmes</h3>
          <ul>
            {programmes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Subjects Offered</h3>
          <ul>
            {subjects.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
