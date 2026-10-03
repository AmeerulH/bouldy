import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FeedbackMessage } from "./feedback-message";

const meta = {
  title: "Feedback/Inline Message",
  component: FeedbackMessage,
  args: { children: "We couldn’t save that attempt. Try again." },
  decorators: [(Story) => <div className="storybook-frame"><Story /></div>],
} satisfies Meta<typeof FeedbackMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {};
export const WithAction: Story = {
  args: { children: <>Earlier visits could not all be loaded. <a href="#" className="font-semibold underline underline-offset-4">Try again</a></> },
};
