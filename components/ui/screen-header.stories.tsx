import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScreenHeader } from "./screen-header";

const meta = {
  title: "Navigation/Screen Header",
  component: ScreenHeader,
  args: { href: "/gyms", label: "Gyms" },
  decorators: [(Story) => <div className="storybook-frame p-0"><Story /></div>],
} satisfies Meta<typeof ScreenHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongParentName: Story = { args: { label: "A gym with a very long name that must truncate" } };
