import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AccountView } from "./components/AccountView";
import { Dashboard, Home } from "./components/Dashboard";
import {
  FieldMonitorTasks,
  StumpRemovalFormWrapper,
  TreeRemovalFormWrapper,
} from "./components/FieldMonitorTasks";
import { Print } from "./components/Print";
import { ProjectsView } from "./components/Projects";
import { TasksProgress } from "./components/TasksProgress";
import { TasksView } from "./components/TasksView";
import { Steps } from "./rxdb/rxdb-schemas";

const rootRoute = createRootRoute({
  component: () => <Dashboard />,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Home />,
  errorComponent: () => "Oh crap!",
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: () => <AccountView />,
  errorComponent: () => "Oh crap!",
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "projects",
  component: () => <ProjectsView />,
  errorComponent: () => "Oh crap!",
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "tasks",
  component: () => <Outlet />,
  errorComponent: () => "Oh crap!",
});

const tasksHome = createRoute({
  getParentRoute: () => tasksRoute,
  path: "/",
  component: () => <TasksView />,
  errorComponent: () => "Oh crap!",
});

const tasksProgressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress",
  component: () => <TasksProgress />,
  errorComponent: () => "Oh crap!",
});

const fieldMonitorTask = createRoute({
  getParentRoute: () => tasksRoute,
  path: "field-monitor",
  component: () => <Outlet />,
  errorComponent: () => "Oh crap!",
});

const fieldMonitorHome = createRoute({
  getParentRoute: () => fieldMonitorTask,
  path: "/",
  component: () => <FieldMonitorTasks />,
  errorComponent: () => "Oh crap!",
});

type FieldMonitorSearch = {
  step: Steps;
  edit?: boolean;
};

const fieldMonitorTree = createRoute({
  getParentRoute: () => fieldMonitorTask,
  path: "tree-removal/$id",
  component: () => <TreeRemovalFormWrapper />,
  errorComponent: () => "Oh crap!",
  validateSearch: (search: Record<string, unknown>): FieldMonitorSearch => ({
    edit: Boolean(search?.edit),
    step:
      search.step === "before" ||
      search.step === "during" ||
      search.step === "after"
        ? search.step
        : "before",
  }),
});

const fieldMonitorStump = createRoute({
  getParentRoute: () => fieldMonitorTask,
  path: "stump-removal/$id",
  component: () => <StumpRemovalFormWrapper />,
  errorComponent: () => "Oh crap!",
  validateSearch: (search: Record<string, unknown>): FieldMonitorSearch => ({
    edit: Boolean(search?.edit),
    step:
      search.step === "before" ||
      search.step === "during" ||
      search.step === "after"
        ? search.step
        : "before",
  }),
});

const fieldMonitorTicketing = createRoute({
  getParentRoute: () => fieldMonitorTask,
  path: "ticketing/$name/$id",
  component: () => <div> will come </div>,
  errorComponent: () => "Oh crap!",
  validateSearch: (
    search: Record<string, unknown>,
  ): Pick<FieldMonitorSearch, "edit"> => ({
    edit: Boolean(search?.edit),
  }),
});

const printRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "print/$id",
  component: () => <Print />,
  errorComponent: () => "Oh crap!",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const routeTree = rootRoute.addChildren([
  homeRoute,
  projectsRoute,
  accountRoute,
  tasksProgressRoute,
  printRoute,
  tasksRoute.addChildren([
    tasksHome,
    fieldMonitorTask.addChildren([
      fieldMonitorHome,
      fieldMonitorTree,
      fieldMonitorStump,
      fieldMonitorTicketing,
    ]),
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPendingComponent: () => <div>router pending...</div>,
  defaultErrorComponent: () => <div>router error...</div>,
});
