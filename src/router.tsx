import {
	Outlet,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { AccountView } from "./components/AccountView";
import { AuthWrapper } from "./components/AuthWrapper";
import { Home } from "./components/Dashboard";
import { FieldMonitorGeneralWrapper } from "./components/FieldMonitorCustom";
import {
	FieldMonitorTasks,
	StumpRemovalFormWrapper,
	TreeRemovalFormWrapper,
} from "./components/FieldMonitorTasks";
import { Log } from "./components/Log";
import { Print } from "./components/Print";
import { ProjectsView } from "./components/Projects";
import { TasksProgress } from "./components/TasksProgress";
import { TasksView } from "./components/TasksView";
import {
	CollectionFormWrapper,
	DisposalFormWrapper,
	TruckTasks,
} from "./components/TruckTasks";
import type { Steps } from "./rxdb/rxdb-schemas";

const rootRoute = createRootRoute({
	component: () => <AuthWrapper />,
});

const homeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: () => <Home />,
	errorComponent: () => "Oh crap!",
});

const accountRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "account",
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
	path: "progress",
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
	path: "ticketing/$ticketingId/$id",
	component: () => <FieldMonitorGeneralWrapper />,
	errorComponent: () => "Oh crap!",
});

const truckTasks = createRoute({
	getParentRoute: () => tasksRoute,
	path: "truck-tasks",
	component: () => <Outlet />,
	errorComponent: () => "Oh crap!",
});

const truckTasksHome = createRoute({
	getParentRoute: () => truckTasks,
	path: "/",
	component: () => <TruckTasks />,
	errorComponent: () => "Oh crap!",
});

const truckTasksCollection = createRoute({
	getParentRoute: () => truckTasks,
	path: "collection/$id",
	component: () => <CollectionFormWrapper />,
	errorComponent: () => "Oh crap!",
});

const truckTasksDisposal = createRoute({
	getParentRoute: () => truckTasks,
	path: "disposal/$id",
	component: () => <DisposalFormWrapper />,
	errorComponent: () => "Oh crap!",
});

const printRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "print/$id",
	component: () => <Print />,
	errorComponent: () => "Oh crap!",
});

const logRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "log",
	component: () => <Log />,
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
	logRoute,
	tasksRoute.addChildren([
		tasksHome,
		fieldMonitorTask.addChildren([
			fieldMonitorHome,
			fieldMonitorTree,
			fieldMonitorStump,
			fieldMonitorTicketing,
		]),
		truckTasks.addChildren([
			truckTasksHome,
			truckTasksCollection,
			truckTasksDisposal,
		]),
	]),
]);

export const router = createRouter({
	routeTree,
	defaultPendingComponent: () => <div>router pending...</div>,
	defaultErrorComponent: () => <div>router error...</div>,
});
