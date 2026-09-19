import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomNav } from "./bottom-nav";

const meta = {
  title: "Navigation/Bottom Navigation",
  component: BottomNav,
  decorators: [(Story) => <div className="storybook-frame flex min-h-72 flex-col justify-end p-0"><Story /></div>],
  parameters: {
    nextjs: { navigation: { pathname: "/sessions" } },
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SessionsActive: Story = {};
