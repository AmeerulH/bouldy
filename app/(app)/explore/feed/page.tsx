import { UnderConstruction } from "@/components/under-construction";

export default function FeedPage() {
  return (
    <UnderConstruction
      back={{ href: "/explore", label: "Explore" }}
      eyebrow="Explore"
      title="Climbers' sessions"
      summary="See sessions that other climbers choose to share, and share your own when you want to."
      coming={[
        "Share a finished session with the gym, route colours and results you pick.",
        "Follow climbers and see their shared sessions in one place.",
        "Reactions and comments, with reporting and moderation.",
      ]}
      blocker="Needs a follow system, per-session sharing controls, moderation and a feed service. Nothing is shared today, and sharing will always be opt in."
      holds={["green", "orange"]}
      related={[
        { href: "/explore/climbers", label: "Find climbers", hint: "Search and view public profiles" },
        { href: "/profile/privacy", label: "Privacy", hint: "Who can find and follow you" },
      ]}
    />
  );
}
