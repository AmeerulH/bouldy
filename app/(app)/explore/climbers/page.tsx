import { UnderConstruction } from "@/components/under-construction";

export default function ClimbersPage() {
  return (
    <UnderConstruction
      back={{ href: "/explore", label: "Explore" }}
      eyebrow="Explore"
      title="Find climbers"
      summary="Search for climbers by handle or display name and open their public profile."
      coming={[
        "Search by handle or display name; hidden accounts never appear.",
        "A public profile with the stats and rank a climber has agreed to show.",
        "Follow a climber to see their shared sessions.",
      ]}
      blocker="Needs discoverable-user search, a public profile response that never includes email or private notes, and privacy rules. Email is never searchable."
      holds={["purple", "teal"]}
      related={[
        { href: "/profile/public", label: "Your public profile", hint: "What other climbers will see" },
        { href: "/explore/leaderboards", label: "Leaderboards", hint: "Gym, global and friend rankings" },
      ]}
    />
  );
}
