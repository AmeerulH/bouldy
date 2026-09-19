import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionHeading } from "./section-heading";

const meta = {
  title: "Foundation/Section Heading",
  component: SectionHeading,
  args: { children: "All sessions", aside: "8 total" },
  decorators: [(Story) => <div className="storybook-frame"><Story /></div>],
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCount: Story = {};
export const WithoutAside: Story = { args: { children: "Route log", aside: undefined } };
