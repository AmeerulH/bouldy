import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BouldyLoader } from "./bouldy-loader";

const meta = {
  title: "Loading/Bouldy Loader",
  component: BouldyLoader,
  args: { variant: "ascent" },
  argTypes: { variant: { control: "select", options: ["ascent", "traverse", "hold"] } },
  decorators: [(Story) => <div className="storybook-frame flex min-h-72 items-center justify-center"><Story /></div>],
} satisfies Meta<typeof BouldyLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ascent: Story = {};
export const Traverse: Story = { args: { variant: "traverse" } };
export const Hold: Story = { args: { variant: "hold" } };
