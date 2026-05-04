import { Button } from "@/components/ui/button";
import { SelectInput } from "@/components/ui/field";

type CompareToolbarProps = {
  availableOptions: Array<{ value: string; label: string }>;
  selectedAddSlug: string;
  onAddSlugChange: (value: string) => void;
  onAddSchool: () => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  selectedPhase: "2A" | "2B" | "2C";
  onPhaseChange: (phase: "2A" | "2B" | "2C") => void;
  onSwapFirstTwo: () => void;
  disableAdd: boolean;
  disableSwap: boolean;
};

export function CompareToolbar({
  availableOptions,
  selectedAddSlug,
  onAddSlugChange,
  onAddSchool,
  selectedYear,
  onYearChange,
  selectedPhase,
  onPhaseChange,
  onSwapFirstTwo,
  disableAdd,
  disableSwap
}: CompareToolbarProps) {
  return (
    <section className="compareToolbar">
      <div className="compareToolbarGrid">
        <SelectInput
          label="Add school"
          value={selectedAddSlug}
          onChange={(event) => onAddSlugChange(event.target.value)}
          options={availableOptions}
        />
        <Button
          className="compareToolbarAddButton"
          onClick={onAddSchool}
          disabled={disableAdd}
        >
          Add to compare
        </Button>

        <SelectInput
          label="Year"
          value={String(selectedYear)}
          onChange={(event) => onYearChange(Number(event.target.value))}
          options={[
            { value: "2025", label: "2025" },
            { value: "2024", label: "2024" }
          ]}
        />
        <SelectInput
          label="Phase"
          value={selectedPhase}
          onChange={(event) => onPhaseChange(event.target.value as "2A" | "2B" | "2C")}
          options={[
            { value: "2A", label: "2A" },
            { value: "2B", label: "2B" },
            { value: "2C", label: "2C" }
          ]}
        />
      </div>
      <div className="compareToolbarActions">
        <Button variant="secondary" onClick={onSwapFirstTwo} disabled={disableSwap}>
          Swap first two schools
        </Button>
      </div>
    </section>
  );
}
