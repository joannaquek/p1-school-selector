import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

export function MethodologySection({
  title,
  subtitle,
  items
}: {
  title: string;
  subtitle?: string;
  items: string[];
}) {
  return (
    <Card as="section">
      <SectionHeader title={title} subtitle={subtitle} />
      <ul className="methodList">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
