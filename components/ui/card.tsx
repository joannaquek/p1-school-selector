import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLElement> & {
  as?: "article" | "section" | "aside" | "div";
};

export function Card({ as = "div", className, children, ...props }: CardProps) {
  const Component = as;
  return (
    <Component className={cn("uiCard", className)} {...props}>
      {children}
    </Component>
  );
}
