import { Outlet, RootRoute, Route, Router } from '@tanstack/router'
import { AccountView } from './components/AccountView'
import { Dashboard, Home } from './components/Dashboard'
import {
  FieldMonitorTasks,
  TreeRemovalFormWrapper
} from './components/FieldMonitorTasks'
import { Print } from './components/Print'
import { ProjectsView } from './components/Projects'
import { TasksProgress } from './components/TasksProgress'
import { TasksView } from './components/TasksView'
import { Steps } from './rxdb/rxdb-schemas'

const rootRoute = new RootRoute({
  component: () => <Dashboard />
})

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Home />,
  errorComponent: () => 'Oh crap!'
})

const accountRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: () => <AccountView />,
  errorComponent: () => 'Oh crap!'
})

const projectsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'projects',
  component: () => <ProjectsView />,
  errorComponent: () => 'Oh crap!'
})

const tasksRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'tasks',
  component: () => <Outlet />,
  errorComponent: () => 'Oh crap!'
})

const tasksHome = new Route({
  getParentRoute: () => tasksRoute,
  path: '/',
  component: () => <TasksView />,
  errorComponent: () => 'Oh crap!'
})

const tasksProgressRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/progress',
  component: () => <TasksProgress />,
  errorComponent: () => 'Oh crap!'
})

const fieldMonitorTask = new Route({
  getParentRoute: () => tasksRoute,
  path: 'field-monitor',
  component: () => <Outlet />,
  errorComponent: () => 'Oh crap!'
})

const fieldMonitorHome = new Route({
  getParentRoute: () => fieldMonitorTask,
  path: '/',
  component: () => <FieldMonitorTasks />,
  errorComponent: () => 'Oh crap!'
})

type FieldMonitorSearch = {
  step: Steps
  edit: boolean
}

const fieldMonitorTree = new Route({
  getParentRoute: () => fieldMonitorTask,
  path: 'tree-removal/$id',
  component: () => <TreeRemovalFormWrapper />,
  errorComponent: () => 'Oh crap!',
  validateSearch: (search: Record<string, unknown>): FieldMonitorSearch => ({
    edit: Boolean(search?.edit),
    step:
      search.step === 'before' ||
      search.step === 'during' ||
      search.step === 'after'
        ? search.step
        : 'before'
  })
})

const printRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'print/$id',
  component: () => <Print />,
  errorComponent: () => 'Oh crap!'
})

declare module '@tanstack/router' {
  interface Register {
    router: typeof router
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
    fieldMonitorTask.addChildren([fieldMonitorHome, fieldMonitorTree])
  ])
])

export const router = new Router({
  routeTree,
  defaultPreload: 'intent'
})
