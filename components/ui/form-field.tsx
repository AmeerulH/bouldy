import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
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

export function TextareaField({ label, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: ReactNode }) {
  return <FieldShell label={label}><textarea className={cn(controlStyles, "resize-y py-3", className)} {...props} /></FieldShell>;
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  compact?: boolean;
  children: ReactNode;
};

export function SelectField({ label, compact, className, children, ...props }: SelectFieldProps) {
  return (
    <FieldShell label={label} compact={compact}>
      {/* Custom chevron so every dropdown has the same inset as the text on the left. */}
      <span className="relative block">
        <select className={cn(controlStyles, "appearance-none bg-bg pl-3.5 pr-10", compact && "min-h-11 pl-3 pr-9 text-sm font-medium", className)} {...props}>
          {children}
        </select>
        <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-current text-ink-muted", compact ? "right-3" : "right-3.5")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </FieldShell>
  );
}
