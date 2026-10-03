import { UnderConstruction } from "@/components/under-construction";

export default function PublicProfilePage() {
  return (
    <UnderConstruction
      back={{ href: "/profile", label: "You" }}
      eyebrow="Your profile"
      title="Public profile"
      summary="Preview exactly what other climbers see before you turn anything on."
      coming={[
        "A preview of your handle, display name and the stats you allow.",
        "Per-item choices for rank, gyms visited and shared sessions.",
        "Your email and private route notes never appear.",
      ]}
      blocker="Needs a public profile response limited to allowed fields, plus the privacy rules behind it. Your profile is private today."
      holds={["teal", "yellow"]}
      related={[{ href: "/profile/privacy", label: "Privacy", hint: "Who can find and follow you" }]}
    />
  );
}
