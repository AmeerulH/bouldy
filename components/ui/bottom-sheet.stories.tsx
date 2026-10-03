import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomSheet } from "./bottom-sheet";
import { FeedbackMessage } from "./feedback-message";
import { InputField } from "./form-field";

const meta = {
  title: "Overlays/Bottom Sheet",
  component: BottomSheet,
  args: { id: "demo", title: "Add a gym", children: null },
  // The sheet is open when the URL carries ?sheet=<id>.
  parameters: { layout: "fullscreen", nextjs: { navigation: { pathname: "/gyms", query: { sheet: "demo" } } } },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Form: Story = {
  render: (args) => (
    <BottomSheet {...args}>
      <div className="flex flex-col gap-4">
        <InputField label="Gym name" placeholder="e.g. Bump Bouldering" />
        <InputField label="Location" placeholder="e.g. Petaling Jaya" />
      </div>
    </BottomSheet>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <BottomSheet {...args}>
      <div className="flex flex-col gap-4">
        <FeedbackMessage>Enter a gym name and location.</FeedbackMessage>
        <InputField label="Gym name" />
      </div>
    </BottomSheet>
  ),
};

export const LongContent: Story = {
  render: (args) => (
    <BottomSheet {...args} title="Long content scrolls">
      <div className="flex flex-col gap-4">
        {Array.from({ length: 12 }, (_, i) => <InputField key={i} label={`Field ${i + 1}`} />)}
      </div>
    </BottomSheet>
  ),
};
