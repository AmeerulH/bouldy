import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Route } from "@/lib/api";
import { RouteBrowser } from "./route-browser";
import { browserItem, ClimbRow, GymRouteRow, SessionRouteRow } from "./route-rows";

const grades = ["VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6"];
const colours = ["Red", "Blue", "Green", "Yellow", "Purple", "Black"];
const walls = ["Slab", "Vertical", "Overhang", "Cave"];
const names = ["Patient heel hook", "Clean finish", "Sloper party", "Crimp city", "Moon kick", "Tiny feet"];

const routes: Route[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  gym_id: i < 32 ? 1 : 2,
  route_name: `${names[i % names.length]} ${Math.floor(i / names.length) + 1}`,
  grade: i < 32 ? grades[(i * 5) % grades.length] : ["Green", "Blue", "Red"][i % 3],
  colour: colours[i % colours.length],
  wall: walls[i % walls.length],
  setter: i % 2 ? "Aina" : null,
  set_date: null,
  styles: i % 3 ? ["Crimps"] : ["Slab", "Balance"],
  status: "active",
  is_competition: false,
}) as Route);

const logAction = async () => {};

const meta = {
  title: "Climbing/Route Browser",
  component: RouteBrowser,
  args: { items: [], storageKey: "story", belowHeader: false },
  parameters: { nextjs: { navigation: { pathname: "/gyms/1" } } },
  decorators: [(Story) => <div className="storybook-frame px-5 py-3"><Story /></div>],
} satisfies Meta<typeof RouteBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Gym detail: grade groups collapse once a wall has more than 12 routes. */
export const GymRoutes: Story = {
  args: { items: routes.filter((route) => route.gym_id === 1).map((route) => browserItem(route, <GymRouteRow route={route} gymId={1} />)) },
};

/** Live session: routes logged today are pinned above the grade groups. */
export const LiveSession: Story = {
  args: {
    storageKey: "story-session",
    statusOptions: [{ value: "new", label: "New to you" }, { value: "project", label: "Projects" }, { value: "sent", label: "Sent" }],
    doneStatuses: ["sent"],
    pinnedTitle: "Today",
    items: routes.filter((route) => route.gym_id === 1).map((route, i) => browserItem(
      route,
      <SessionRouteRow route={route} sessionId={1} status={i < 3 ? `${i + 1} tries today` : "Not tried yet"} logAction={logAction} />,
      { status: i < 3 ? "project" : "new", pinned: i < 3 },
    )),
  },
};

export const GradeSelected: Story = {
  ...GymRoutes,
  parameters: { nextjs: { navigation: { pathname: "/gyms/1", query: { grade: "v3" } } } },
};

/** Climbs collection: gyms first, because grades only compare within one gym. */
export const ClimbsByGym: Story = {
  args: {
    storageKey: "story-climbs",
    groupByGym: true,
    statusOptions: [{ value: "flash", label: "Flash" }, { value: "sent", label: "Sent" }, { value: "project", label: "Project" }],
    doneStatuses: ["sent", "flash"],
    items: routes.map((route, i) => browserItem(
      route,
      <ClimbRow route={route} best={i % 3 === 0 ? "flash" : i % 3 === 1 ? "send" : "project"} tries={1 + (i % 4)} visits={1 + (i % 2)} />,
      { status: i % 3 === 0 ? "flash" : i % 3 === 1 ? "sent" : "project", gym: { id: route.gym_id, name: route.gym_id === 1 ? "Sample climbing gym" : "Second wall co" } },
    )),
  },
};

export const NoMatches: Story = {
  ...GymRoutes,
  parameters: { nextjs: { navigation: { pathname: "/gyms/1", query: { q: "zzz" } } } },
};
