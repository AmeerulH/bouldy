"use client";

import { useState } from "react";
import type { Route } from "@/lib/api";
import { ROUTE_COLOURS, ROUTE_STYLES, normaliseRouteColour } from "@/lib/route-options";
import { RouteHold } from "@/components/route-hold";
import { SubmitButton } from "@/components/submit-button";
import { buttonStyles } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/ui/form-field";

type RouteFormProps = {
  action: (formData: FormData) => Promise<void>;
  gymId: number;
  sessionId?: number;
  route?: Route;
};

export function RouteForm({ action, gymId, sessionId, route }: RouteFormProps) {
  const [colour, setColour] = useState(normaliseRouteColour(route?.colour) ?? "");
  const [grade, setGrade] = useState(route?.grade ?? "");
  const [showStyles, setShowStyles] = useState(Boolean(route && route.styles.length > 1));
  const mainStyle = route?.styles[0] ?? "";

  return (
    <form action={action} className="mt-5 flex flex-col gap-5">
      <input type="hidden" name="gym_id" value={gymId} />
      {sessionId ? <input type="hidden" name="session_id" value={sessionId} /> : null}
      {route ? <input type="hidden" name="route_id" value={route.id} /> : null}

      <div className="flex items-center gap-4 rounded-2xl bg-panel px-4 py-3 text-panel-ink">
        <RouteHold colour={colour || "grey"} className="h-20 w-20 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-panel-ink-muted">Route preview</p>
          <p className="mt-1 truncate font-display text-3xl font-extrabold uppercase leading-none">{grade.trim() || "—"}</p>
          <p className="mt-1 text-sm text-panel-ink-muted">{colour ? `${colour[0].toUpperCase()}${colour.slice(1)} hold` : "Choose a hold colour"}</p>
        </div>
      </div>

      <InputField label="Gym grade" name="grade" required placeholder="e.g. V3 or 3 dots" defaultValue={route?.grade} onChange={(event) => setGrade(event.target.value)} />

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Route colour</legend>
        <p className="mt-1 text-xs text-ink-muted">Pick the hold you see on the wall.</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {ROUTE_COLOURS.map((option) => {
            const value = option.toLowerCase();
            return (
              <label key={option} className="route-colour-option relative cursor-pointer rounded-xl border border-hairline px-1 py-2 text-center text-xs font-semibold text-ink-muted has-[:checked]:border-accent has-[:checked]:bg-accent-tint has-[:checked]:text-ink has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
                <input className="sr-only" type="radio" name="colour" value={option} checked={colour === value} onChange={() => setColour(value)} required />
                <RouteHold colour={value} className="mx-auto h-12 w-12" />
                <span className="mt-1 block truncate">{option}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <InputField label="Wall / area" name="wall" placeholder="Optional" defaultValue={route?.wall ?? ""} />
        <SelectField label="Main style" name="main_style" defaultValue={mainStyle}>
          <option value="">Not recorded</option>
          {ROUTE_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}
        </SelectField>
      </div>

      <details className="group border-y border-hairline py-2" open={showStyles} onToggle={(event) => setShowStyles(event.currentTarget.open)}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink marker:content-none">
          Add more styles <span aria-hidden="true" className="text-lg text-accent transition-transform group-open:rotate-45">+</span>
        </summary>
        <fieldset className="pb-3">
          <legend className="sr-only">Other styles</legend>
          <p className="text-xs text-ink-muted">Select as many as fit this route.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROUTE_STYLES.map((style) => (
              <label key={style} className="relative cursor-pointer rounded-full border border-hairline px-3 py-2 text-xs font-semibold text-ink-muted has-[:checked]:border-ink has-[:checked]:bg-panel has-[:checked]:text-panel-ink has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent">
                <input className="sr-only" type="checkbox" name="style" value={style} defaultChecked={route?.styles.includes(style) && style !== mainStyle} />
                {style}
              </label>
            ))}
          </div>
        </fieldset>
      </details>

      <div className="grid grid-cols-1 gap-4 border-t border-hairline pt-4">
        <InputField label="Route name" name="route_name" required placeholder="e.g. Red Horizon" defaultValue={route?.route_name} />
        <InputField label="Setter" name="setter" placeholder="Optional" defaultValue={route?.setter ?? ""} />
      </div>

      <div className="rounded-xl border border-hairline px-3 py-3">
        <p className="text-sm font-semibold text-ink">Competition route</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">Coming soon. Once the gym can mark a route as a comp route, Zone will appear in its session log.</p>
      </div>

      <SubmitButton type="submit" pendingLabel={route ? "Saving route" : "Adding route"} className={buttonStyles()}>
        {route ? "Save route" : "Add route"}
      </SubmitButton>
    </form>
  );
}
