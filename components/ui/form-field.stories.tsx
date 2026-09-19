import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InputField, SelectField } from "./form-field";

const meta = {
  title: "Forms/Fields",
  component: InputField,
  args: { label: "Route name", name: "route_name" },
  decorators: [(Story) => <div className="storybook-frame"><Story /></div>],
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = { args: { placeholder: "e.g. Blue Note" } };
export const NumberInput: Story = { args: { label: "Attempts", name: "attempts", type: "number", min: 1, defaultValue: 1, compact: true } };
export const Select: Story = {
  args: {},
  render: () => (
    <SelectField label="Route colour" name="colour" defaultValue="blue">
      <option value="red">Red</option>
      <option value="blue">Blue</option>
      <option value="green">Green</option>
    </SelectField>
  ),
};
