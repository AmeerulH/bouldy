import Link from "next/link";
import { getGyms } from "@/lib/api";
import { startSessionAction } from "@/lib/actions";

export default async function GymsPage() {
  const gyms = await getGyms();

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-6">
      <header>
        <Link href="/" className="text-xs font-medium text-ink-faint">
          ← Home
        </Link>
        <h1 className="font-display text-2xl font-extrabold uppercase leading-none text-ink">
          Pick a gym
        </h1>
      </header>

      {gyms.length === 0 ? (
        <p className="text-sm text-ink-muted">No gyms yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {gyms.map((gym) => (
            <form key={gym.id} action={startSessionAction}>
              <input type="hidden" name="gym_id" value={gym.id} />
              <button
                type="submit"
                className="w-full rounded-2xl bg-panel px-5 py-4 text-left"
              >
                <p className="font-display text-lg font-bold uppercase text-panel-ink">
                  {gym.name}
                </p>
                <p className="text-xs text-panel-ink-muted">{gym.location}</p>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
