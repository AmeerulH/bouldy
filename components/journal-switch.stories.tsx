import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { JournalSwitch } from "./journal-switch";
import { MonthGroups } from "./month-groups";

const meta = {
  title: "Navigation/Journal Switch",
  component: JournalSwitch,
  args: { active: "sessions" },
  decorators: [(Story) => <div className="storybook-frame px-5 py-5"><Story /></div>],
} satisfies Meta<typeof JournalSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sessions: Story = {};
export const Climbs: Story = { args: { active: "climbs" } };

const months = ["October 2026", "September 2026", "August 2026", "July 2026", "June 2026"].map((label, i) => ({
  key: `m${i}`,
  label,
  meta: `${3 - (i % 2)} sessions`,
  content: <p className="py-4 text-sm text-ink-muted">Session rows for {label}</p>,
}));

/** Sessions list paging: three months first, then "Show earlier months". */
export const MonthPaging: Story = {
  render: () => <MonthGroups months={months} />,
};
