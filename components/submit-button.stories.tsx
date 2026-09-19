import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SubmitButton } from "./submit-button";
import { buttonStyles } from "./ui/button";

const meta = {
  title: "Actions/Submit Button",
  component: SubmitButton,
  args: { children: "Save route", pendingLabel: "Saving route", className: buttonStyles() },
  decorators: [(Story) => <div className="storybook-frame"><form><Story /></form></div>],
} satisfies Meta<typeof SubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
export const Disabled: Story = { args: { disabled: true } };
