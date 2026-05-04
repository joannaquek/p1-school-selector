import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const resolvedType = props.type ?? "button";

  return (
    <button
      type={resolvedType}
      className={cn("uiButton", `uiButton--${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}
