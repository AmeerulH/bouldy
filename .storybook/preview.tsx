import type { Preview } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import "../app/globals.css";
import "./storybook.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="storybook-canvas">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    options: {
      storySort: {
        order: ["Foundation", "Actions", "Forms", "Feedback", "Brand", "Climbing", "Navigation", "Loading"],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;

export function StoryFrame({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <div className={dark ? "storybook-frame storybook-frame--dark" : "storybook-frame"}>{children}</div>;
}
