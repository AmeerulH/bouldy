import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Snackbar } from "./snackbar";

const meta = {
  title: "Feedback/Snackbar",
  component: Snackbar,
  args: { message: "Route added to this gym.", onDismiss: () => {} },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="storybook-frame relative min-h-40 px-3 pt-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Floats over the top of the screen; tapping anywhere on it dismisses. */
export const Success: Story = {};
export const LongMessage: Story = { args: { message: "Gym added. You can start a session now, or add its routes first." } };
export const Leaving: Story = { args: { leaving: true } };
