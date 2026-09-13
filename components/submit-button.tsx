"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Working",
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      aria-busy={pending}
      className={`button-feedback ${className ?? ""}`}
    >
      <span className={pending ? "invisible" : ""}>{children}</span>
      {pending ? (
        <span className="button-loader" aria-live="polite">
          <span className="button-loader__spinner" aria-hidden="true" />
          {pendingLabel}
        </span>
      ) : null}
    </button>
  );
}
