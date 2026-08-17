"use client";

import { useEffect, useState } from "react";

const ACCENTS = [
  { id: "red", label: "Red", swatch: "oklch(0.58 0.21 24)" },
  { id: "blue", label: "Blue", swatch: "oklch(0.56 0.16 250)" },
  { id: "green", label: "Green", swatch: "oklch(0.6 0.17 145)" },
] as const;

// Temporary dev tool for comparing accent candidates — remove once one is locked in.
export function ThemeSwitcher() {
  const [active, setActive] = useState<string>("red");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-accent") ?? "red";
    setActive(current);
  }, []);

  function selectAccent(id: string) {
    document.documentElement.setAttribute("data-accent", id);
    localStorage.setItem("bouldy-accent", id);
    setActive(id);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Accent color preview"
      style={{
        position: "fixed",
        bottom: "max(16px, env(safe-area-inset-bottom))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        gap: "8px",
        padding: "6px",
        borderRadius: "999px",
        background: "oklch(0.16 0 0 / 92%)",
        boxShadow: "0 2px 8px oklch(0 0 0 / 20%)",
      }}
    >
      {ACCENTS.map((accent) => (
        <button
          key={accent.id}
          type="button"
          role="radio"
          aria-checked={active === accent.id}
          aria-label={accent.label}
          onClick={() => selectAccent(accent.id)}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: accent.swatch,
            border:
              active === accent.id
                ? "2px solid oklch(0.98 0 0)"
                : "2px solid transparent",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );
}
