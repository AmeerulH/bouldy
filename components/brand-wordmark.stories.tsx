import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BrandWordmark } from "./brand-wordmark";

const meta = {
  title: "Brand/Wordmark",
  component: BrandWordmark,
  args: { compact: false },
  decorators: [(Story) => <div className="storybook-frame"><Story /></div>],
} satisfies Meta<typeof BrandWordmark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {};
export const MarkOnly: Story = { args: { compact: true } };
