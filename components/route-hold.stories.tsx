import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RouteHold } from "./route-hold";

const colours = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white"];

const meta = {
  title: "Climbing/Route Hold",
  component: RouteHold,
  args: { colour: "red", routeName: "Red Horizon", className: "h-24 w-24" },
  argTypes: { colour: { control: "select", options: colours } },
  decorators: [(Story) => <div className="storybook-frame"><Story /></div>],
} satisfies Meta<typeof RouteHold>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};
export const AllColours: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {colours.map((colour) => <RouteHold key={colour} colour={colour} className="h-20 w-20" />)}
    </div>
  ),
};
export const AreteVariant: Story = { args: { colour: "blue", routeName: "The Arete" } };
