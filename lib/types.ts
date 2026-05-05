export type IntakeDirection = "increase" | "decrease" | "no-change";

export type SchoolCardData = {
  slug: string;
  name: string;
  address: string;
  postalCode: string;
  lat: number | null;
  lng: number | null;
  /** `null` until home address is geocoded (OneMap). */
  distanceKm: number | null;
  ballotingPressure: "Low" | "Moderate" | "High";
  intakeDirection: IntakeDirection;
  intakeDelta: number;
  ccas: string[];
  programmes: string[];
  affiliation: string | null;
};

export type BallotingPhaseRecord = {
  year: number;
  phase: "2A" | "2B" | "2C";
  vacancies: number;
  applicants: number;
  balloted: boolean;
};

export type SourceLink = {
  label: string;
  url: string;
  lastUpdated: string;
};

export type SchoolDetailData = SchoolCardData & {
  subjects: string[];
  distinctiveProgrammes: string[];
  affiliationNotes: string;
  ballotingHistory: BallotingPhaseRecord[];
  sourceLinks: SourceLink[];
};
