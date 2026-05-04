import type { IntakeDirection } from "@/lib/types";
import { cn } from "@/lib/cn";

type IntakeChangeBadgeProps = {
  direction: IntakeDirection;
  delta: number;
};

function intakeLabel(direction: IntakeDirection, delta: number) {
  if (direction === "increase") return `+${Math.abs(delta)} seats`;
  if (direction === "decrease") return `-${Math.abs(delta)} seats`;
  return "No change";
}

export function IntakeChangeBadge({ direction, delta }: IntakeChangeBadgeProps) {
  return (
    <span
      className={cn(
        "pill",
        direction === "increase"
          ? "increase"
          : direction === "decrease"
          ? "decrease"
          : "neutral"
      )}
    >
      Intake: {intakeLabel(direction, delta)}
    </span>
  );
}
