import { UnderConstruction } from "@/components/under-construction";

export default function ChallengesPage() {
  return (
    <UnderConstruction
      back={{ href: "/explore", label: "Explore" }}
      eyebrow="Explore"
      title="Challenges"
      summary="Join a gym or community challenge with a clear goal, a start date and an end date."
      coming={[
        "Challenges set by a gym or the community, with the rules stated up front.",
        "Join with one tap and track progress from your normal logging.",
        "Results that respect wall resets and the challenge's time window.",
      ]}
      blocker="Needs challenge definitions, join and progress tracking, reset boundaries, anti-abuse checks and a verification policy. Gym-run challenges also need operator tools."
      holds={["orange", "pink"]}
      related={[
        { href: "/explore/leaderboards", label: "Leaderboards", hint: "Gym, global and friend rankings" },
        { href: "/explore/groups", label: "Groups and leagues", hint: "Private crews and seasons" },
      ]}
    />
  );
}
