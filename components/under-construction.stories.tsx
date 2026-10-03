import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UnderConstruction } from "./under-construction";

const meta = {
  title: "Pages/Under Construction",
  component: UnderConstruction,
  parameters: { layout: "fullscreen" },
  args: {
    back: { href: "/explore", label: "Explore" },
    eyebrow: "Explore",
    title: "Leaderboards",
    summary: "Rankings you can understand: who is on the board, how points are earned, and how each result was recorded.",
    coming: ["Gym boards first, limited to a time period.", "A visible scoring rule.", "Your own rank."],
    blocker: "Needs agreed scoring, periods and an opt-in ranking service.",
  },
} satisfies Meta<typeof UnderConstruction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TabRoot: Story = { args: { back: undefined } };
export const WithRelatedLinks: Story = {
  args: { related: [{ href: "/explore/groups", label: "Groups and leagues", hint: "Private crews and seasons" }] },
};
