import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageSkeleton } from "./page-skeleton";

const meta = {
  title: "Loading/Page Skeleton",
  component: PageSkeleton,
  args: { page: "sessions" },
  argTypes: { page: { control: "select", options: ["home", "sessions", "session", "gyms", "login", "signup"] } },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PageSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sessions: Story = {};
export const Home: Story = { args: { page: "home" } };
export const SessionDetail: Story = { args: { page: "session" } };
export const Gyms: Story = { args: { page: "gyms" } };
export const Login: Story = { args: { page: "login" } };
export const Signup: Story = { args: { page: "signup" } };
