import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthHeading } from "./auth-heading";

const meta = {
  title: "Brand/Auth Heading",
  component: AuthHeading,
  args: { signup: false },
  decorators: [(Story) => <div className="storybook-frame"><Story /></div>],
} satisfies Meta<typeof AuthHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {};
export const Signup: Story = { args: { signup: true } };
