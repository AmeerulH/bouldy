import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RouteForm } from "./route-form";

const meta = {
  title: "Climbing/Route Form",
  component: RouteForm,
  args: { gymId: 1, action: async () => {} },
  decorators: [(Story) => <div className="storybook-frame px-5 py-5"><Story /></div>],
} satisfies Meta<typeof RouteForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AddRoute: Story = {};

export const LongSessionScroll: Story = {
  decorators: [
    (Story) => (
      <div className="app-shell">
        <div className="app-shell__body">
          <div className="app-shell__scroll">
            <div aria-hidden="true" className="h-[1800px]" />
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
};

export const EditRoute: Story = {
  args: {
    route: {
      id: 24,
      gym_id: 1,
      route_name: "Red Horizon",
      grade: "V3",
      colour: "Teal",
      wall: "Cave wall",
      setter: "Fawwaz",
      set_date: "2026-09-30",
      retired_date: null,
      status: "active",
      styles: ["Overhang", "Pinches", "Heel Hook"],
    },
  },
};
