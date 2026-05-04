import { cn } from "@/lib/cn";

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  wrapperClassName?: string;
};

export function TextInput({
  label,
  wrapperClassName,
  className,
  id,
  ...props
}: TextInputProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label className={cn("uiField", wrapperClassName)} htmlFor={inputId}>
      <span className="uiFieldLabel">{label}</span>
      <input id={inputId} className={cn("uiInput", className)} {...props} />
    </label>
  );
}

type SelectInputProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ value: string; label: string }>;
};

export function SelectInput({
  label,
  options,
  className,
  id,
  ...props
}: SelectInputProps) {
  const selectId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label className="uiField" htmlFor={selectId}>
      <span className="uiFieldLabel">{label}</span>
      <select id={selectId} className={cn("uiSelect", className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
