import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "./button";

function ButtonPreview({ label, variant, size, disabled }: { label: string; variant: ButtonVariant; size: ButtonSize; disabled?: boolean }) {
  return <button type="button" disabled={disabled} className={buttonStyles({ variant, size })}>{label}</button>;
}

const meta = {
  title: "Actions/Button",
  component: ButtonPreview,
  args: { label: "Start a session", variant: "primary", size: "md", disabled: false },
  argTypes: {
    variant: { control: "select", options: ["primary", "dark", "soft", "plain"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  decorators: [(Story) => <div className="storybook-frame"><Story /></div>],
} satisfies Meta<typeof ButtonPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Dark: Story = { args: { label: "End session", variant: "dark" } };
export const Soft: Story = { args: { label: "Correct log", variant: "soft" } };
export const Disabled: Story = { args: { disabled: true } };
