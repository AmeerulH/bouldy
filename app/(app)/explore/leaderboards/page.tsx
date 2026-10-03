import { UnderConstruction } from "@/components/under-construction";

export default function LeaderboardsPage() {
  return (
    <UnderConstruction
      back={{ href: "/explore", label: "Explore" }}
      eyebrow="Explore"
      title="Leaderboards"
      summary="Rankings you can understand: who is on the board, how points are earned, and how each result was recorded."
      coming={[
        "Gym boards first, limited to a time period, so grades stay comparable.",
        "A visible scoring rule, with results marked self-reported or verified.",
        "Your own rank, even when you are outside the top of the list.",
        "Global boards later, only once gym grades can be mapped fairly.",
      ]}
      blocker="Needs agreed scoring, periods, ties and eligibility, an opt-in ranking service, and grade mapping between gyms. Self-reported sends are not treated as verified results."
      holds={["yellow", "red"]}
      related={[
        { href: "/explore/groups", label: "Groups and leagues", hint: "Private crews and seasons" },
        { href: "/explore/challenges", label: "Challenges", hint: "Gym and community goals with dates" },
      ]}
    />
  );
}
