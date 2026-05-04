import { Chip } from "@/components/ui/chip";
import { SelectInput } from "@/components/ui/field";
import { SectionHeader } from "@/components/ui/section-header";
import type {
  CcaCategory,
  DistanceBand,
  PhaseFilter,
  PressureFilter
} from "@/lib/filter-state";

type FilterPanelProps = {
  distanceBand: DistanceBand;
  pressure: PressureFilter;
  affiliationOnly: boolean;
  phase: PhaseFilter;
  year: number;
  ccas: CcaCategory[];
  onDistanceBandChange: (value: DistanceBand) => void;
  onPressureChange: (value: PressureFilter) => void;
  onAffiliationOnlyChange: (value: boolean) => void;
  onPhaseChange: (value: PhaseFilter) => void;
  onYearChange: (value: number) => void;
  onToggleCca: (value: CcaCategory) => void;
};

export function FilterPanel({
  distanceBand,
  pressure,
  affiliationOnly,
  phase,
  year,
  ccas,
  onDistanceBandChange,
  onPressureChange,
  onAffiliationOnlyChange,
  onPhaseChange,
  onYearChange,
  onToggleCca
}: FilterPanelProps) {
  return (
    <aside className="filterPanel" aria-label="Filter schools">
      <SectionHeader title="Filters" />
      <SelectInput
        label="Distance band"
        value={distanceBand}
        onChange={(event) =>
          onDistanceBandChange(event.target.value as DistanceBand)
        }
        options={[
          { value: "1", label: "Within 1km" },
          { value: "2", label: "Within 2km" },
          { value: "3", label: "Within 3km" },
          { value: "4", label: "Any distance" }
        ]}
      />

      <SelectInput
        label="Balloting pressure"
        value={pressure}
        onChange={(event) => onPressureChange(event.target.value as PressureFilter)}
        options={[
          { value: "all", label: "All" },
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
          { value: "high", label: "High" }
        ]}
      />

      <SelectInput
        label="Reference year"
        value={String(year)}
        onChange={(event) => onYearChange(Number(event.target.value))}
        options={[
          { value: "2025", label: "2025" },
          { value: "2024", label: "2024" }
        ]}
      />

      <SelectInput
        label="Reference phase"
        value={phase}
        onChange={(event) => onPhaseChange(event.target.value as PhaseFilter)}
        options={[
          { value: "2A", label: "2A" },
          { value: "2B", label: "2B" },
          { value: "2C", label: "2C" }
        ]}
      />

      <label className="checkboxRow">
        <input
          type="checkbox"
          checked={affiliationOnly}
          onChange={(event) => onAffiliationOnlyChange(event.target.checked)}
        />
        <span>Show only schools with affiliation pathways</span>
      </label>

      <div className="chipGroup" aria-label="CCA interest filters">
        <Chip
          active={ccas.includes("Sports")}
          onClick={() => onToggleCca("Sports")}
        >
          Sports
        </Chip>
        <Chip
          active={ccas.includes("Performing Arts")}
          onClick={() => onToggleCca("Performing Arts")}
        >
          Performing Arts
        </Chip>
        <Chip
          active={ccas.includes("Uniformed Groups")}
          onClick={() => onToggleCca("Uniformed Groups")}
        >
          Uniformed Groups
        </Chip>
        <Chip
          active={ccas.includes("Clubs & Societies")}
          onClick={() => onToggleCca("Clubs & Societies")}
        >
          Clubs & Societies
        </Chip>
      </div>
    </aside>
  );
}
