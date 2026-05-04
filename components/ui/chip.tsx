import { cn } from "@/lib/cn";

type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function Chip({ active = false, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn("uiChip", active && "uiChip--active", className)}
      {...props}
    >
      {children}
    </button>
  );
}
