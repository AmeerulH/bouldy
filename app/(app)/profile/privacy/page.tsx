import { UnderConstruction } from "@/components/under-construction";

export default function PrivacyPage() {
  return (
    <UnderConstruction
      back={{ href: "/profile", label: "You" }}
      eyebrow="Your profile"
      title="Privacy"
      summary="Decide who can find you, follow you and see your results, with everything off by default."
      coming={[
        "Choose whether climbers can find you in search.",
        "Choose whether you appear on leaderboards.",
        "Control which sessions are shared, and block or report accounts.",
      ]}
      blocker="Needs visibility settings stored with your account and enforced by the API. Until then, only you can see your journal."
      holds={["black", "white"]}
      related={[{ href: "/profile/edit", label: "Edit profile", hint: "Display name, bio and photo" }]}
    />
  );
}
