import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageLoader } from "./page-loader";

const meta = {
  title: "Loading/Page Loader",
  component: PageLoader,
  args: { label: "Finding your next hold…", variant: "ascent" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PageLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Journal: Story = { args: { label: "Opening your journal…", variant: "traverse" } };
