"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EvidenceDisclosure } from "@/components/evidence-disclosure";
import { IntakeChangeBadge } from "@/components/intake-change-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MAX_COMPARE_SCHOOLS,
  addSchoolToCompare,
  readCompareSlugsFromStorage,
  writeCompareSlugsToStorage
} from "@/lib/compare-state";
import type { PhaseFilter } from "@/lib/filter-state";
import { toSchoolCard } from "@/lib/school-data";
import type { SchoolDetailData } from "@/lib/types";

export function SchoolSnapshotHeader({
  school,
  year,
  phase
}: {
  school: SchoolDetailData;
  year: number;
  phase: PhaseFilter;
}) {
  const [compareSlugs, setCompareSlugs] = useState<string[]>(() =>
    readCompareSlugsFromStorage()
  );
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    writeCompareSlugsToStorage(compareSlugs);
  }, [compareSlugs]);

  function onAddToCompare() {
    const result = addSchoolToCompare(compareSlugs, school.slug);
    setCompareSlugs(result.next);
    if (result.reason === "duplicate") {
      setFeedback("Already in compare list.");
      return;
    }
    if (result.reason === "limit") {
      setFeedback(`Maximum ${MAX_COMPARE_SCHOOLS} schools in compare.`);
      return;
    }
    setFeedback("Added to compare.");
  }

  const compareHref = `/compare?schools=${compareSlugs.join(",")}&year=${year}&phase=${phase}`;
  const backHref = `/?year=${year}&phase=${phase}`;
  const card = toSchoolCard(school, year, phase);
  const generalInfoSource = school.sourceLinks.find((source) =>
    source.label.toLowerCase().includes("general")
  );
  const intakeSource = school.sourceLinks.find((source) =>
    source.label.toLowerCase().includes("intake")
  );
  const ballotingSource = school.sourceLinks.find((source) =>
    source.label.toLowerCase().includes("balloting")
  );

  return (
    <Card as="section" className="snapshotCard">
      <p className="eyebrow">School Snapshot</p>
      <div className="snapshotHeader">
        <div>
          <h1>{school.name}</h1>
          <p>
            {school.address} S({school.postalCode})
          </p>
        </div>
        <div className="snapshotActions">
          <Button variant="secondary" onClick={onAddToCompare}>
            Add to compare
          </Button>
          <Link className="uiButton uiButton--secondary" href={compareHref}>
            Open compare ({compareSlugs.length})
          </Link>
          <Link className="uiButton uiButton--ghost" href={backHref}>
            Back to results
          </Link>
        </div>
      </div>
      {feedback ? <p className="caption">{feedback}</p> : null}

      <div className="snapshotMetrics">
        <div className="metric">
          <p>Distance from home</p>
          <strong>
            {card.distanceKm === null ? "—" : `${card.distanceKm.toFixed(1)} km`}
          </strong>
          <EvidenceDisclosure
            description="Distance is calculated from the entered address location to the school's location coordinates."
            source={generalInfoSource}
          />
        </div>
        <div className="metric">
          <p>Balloting pressure</p>
          <strong className={`pill ${card.ballotingPressure.toLowerCase()}`}>
            {card.ballotingPressure}
          </strong>
          <EvidenceDisclosure
            description="Pressure label is derived from historical applicant-to-vacancy ratios by phase."
            source={ballotingSource}
          />
        </div>
        <div className="metric">
          <p>Current cycle capacity</p>
          <IntakeChangeBadge
            direction={school.intakeDirection}
            delta={school.intakeDelta}
          />
          <EvidenceDisclosure
            description="Intake change compares the latest reported cycle seats with the prior cycle."
            source={intakeSource}
          />
        </div>
      </div>
    </Card>
  );
}
