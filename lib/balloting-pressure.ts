export function ballotingPressureFromRatio(
  applicants: number,
  vacancies: number
): "Low" | "Moderate" | "High" {
  if (vacancies <= 0 || !Number.isFinite(applicants)) return "Moderate";
  const r = applicants / vacancies;
  if (r >= 1.5) return "High";
  if (r >= 1.0) return "Moderate";
  return "Low";
}
