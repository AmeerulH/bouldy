import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RouteMark } from "./route-mark";

const meta = {
  title: "Climbing/Route Mark",
  component: RouteMark,
  args: { colour: "blue", grade: "V3" },
  decorators: [(Story) => <div className="storybook-frame"><Story /></div>],
} satisfies Meta<typeof RouteMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const HighContrast: Story = { args: { colour: "yellow", grade: "V5" } };
