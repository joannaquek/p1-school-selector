import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PhaseFilter } from "@/lib/filter-state";
import type { SchoolCardData } from "@/lib/types";

const pressureClass: Record<SchoolCardData["ballotingPressure"], string> = {
  Low: "low",
  Moderate: "moderate",
  High: "high"
};

function intakeLabel(delta: number) {
  if (delta > 0) return `+${delta} seats`;
  if (delta < 0) return `${delta} seats`;
  return "No change";
}

function formatDistanceKm(km: number | null) {
  if (km === null) return "—";
  return `${km.toFixed(1)} km`;
}

type SchoolResultCardProps = {
  school: SchoolCardData;
  year: number;
  phase: PhaseFilter;
  onAddToCompare: (slug: string) => void;
};

export function SchoolResultCard({
  school,
  year,
  phase,
  onAddToCompare
}: SchoolResultCardProps) {
  return (
    <Card as="article" className="schoolCard">
      <header className="cardHeader">
        <div>
          <h3>
            <Link href={`/schools/${school.slug}?year=${year}&phase=${phase}`}>
              {school.name}
            </Link>
          </h3>
          <p>
            {school.address} S({school.postalCode})
          </p>
        </div>
        <Button variant="secondary" onClick={() => onAddToCompare(school.slug)}>
          Add to compare
        </Button>
      </header>

      <div className="metrics">
        <div className="metric">
          <p>Distance</p>
          <strong>{formatDistanceKm(school.distanceKm)}</strong>
        </div>
        <div className="metric">
          <p>Balloting pressure</p>
          <strong className={`pill ${pressureClass[school.ballotingPressure]}`}>
            {school.ballotingPressure}
          </strong>
        </div>
        <div className="metric">
          <p>Intake change</p>
          <strong
            className={`pill ${
              school.intakeDirection === "increase"
                ? "increase"
                : school.intakeDirection === "decrease"
                ? "decrease"
                : "neutral"
            }`}
          >
            {intakeLabel(school.intakeDelta)}
          </strong>
        </div>
      </div>

      <div className="listRow">
        <p>Top CCA fit</p>
        <ul>
          {school.ccas.slice(0, 3).map((cca) => (
            <li key={cca}>{cca}</li>
          ))}
        </ul>
      </div>

      <div className="listRow">
        <p>Pathway</p>
        <span>{school.affiliation ?? "No official affiliation listed"}</span>
      </div>
    </Card>
  );
}
