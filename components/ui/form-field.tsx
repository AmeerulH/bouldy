import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  label: ReactNode;
  compact?: boolean;
  children: ReactNode;
};

const controlStyles = "min-h-12 w-full rounded-xl border border-hairline bg-transparent px-3.5 text-base font-normal text-ink outline-none placeholder:text-ink-faint focus:border-accent";

function FieldShell({ label, compact = false, children }: FieldShellProps) {
  return (
    <label className={cn("flex flex-col gap-1.5 font-semibold text-ink", compact ? "text-xs" : "text-sm")}>
      {label}
      {children}
    </label>
  );
}

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  compact?: boolean;
};

export function InputField({ label, compact, className, ...props }: InputFieldProps) {
  return (
    <FieldShell label={label} compact={compact}>
      <input className={cn(controlStyles, compact && "min-h-11 px-3 text-sm font-medium", className)} {...props} />
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  compact?: boolean;
  children: ReactNode;
};

export function SelectField({ label, compact, className, children, ...props }: SelectFieldProps) {
  return (
    <FieldShell label={label} compact={compact}>
      <select className={cn(controlStyles, "bg-bg px-3", compact && "min-h-11 text-sm font-medium", className)} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}
