import { UnderConstruction } from "@/components/under-construction";

export default function EditProfilePage() {
  return (
    <UnderConstruction
      back={{ href: "/profile", label: "You" }}
      eyebrow="Your profile"
      title="Edit profile"
      summary="Choose a display name, add a short bio and a photo, while your unique handle stays the same."
      coming={[
        "A display name separate from your handle.",
        "An optional bio and profile photo.",
        "Email and password changes in their own account flow.",
      ]}
      blocker="The API has no profile update contract yet, and photos need media storage. Your username and email are read-only for now."
      holds={["red", "grey"]}
      related={[{ href: "/profile/public", label: "Public profile", hint: "What other climbers will see" }]}
    />
  );
}
