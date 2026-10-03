import { UnderConstruction } from "@/components/under-construction";

export default function GroupsPage() {
  return (
    <UnderConstruction
      back={{ href: "/explore", label: "Explore" }}
      eyebrow="Explore"
      title="Groups and leagues"
      summary="Start a private group with your climbing crew and compare results across a season."
      coming={[
        "Create a group and invite friends with a link.",
        "A member list with roles, and clear joining and leaving rules.",
        "League standings with visible dates, timezone and rules.",
      ]}
      blocker="Needs group membership, invitations, roles, seasons and standings. Private standings must never be visible to non-members."
      holds={["blue", "mint"]}
      related={[
        { href: "/explore/leaderboards", label: "Leaderboards", hint: "Gym, global and friend rankings" },
        { href: "/explore/challenges", label: "Challenges", hint: "Gym and community goals with dates" },
      ]}
    />
  );
}
