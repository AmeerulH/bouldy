import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FeedbackMessage } from "./feedback-message";

const meta = {
  title: "Feedback/Message",
  component: FeedbackMessage,
  args: { children: "We couldn’t save that attempt. Try again.", tone: "error" },
  decorators: [(Story) => <div className="storybook-frame"><Story /></div>],
} satisfies Meta<typeof FeedbackMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {};
export const Success: Story = { args: { children: "Route added to your session.", tone: "success" } };
