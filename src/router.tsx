import { Outlet, RootRoute, Route, Router } from '@tanstack/router'
import { AccountView } from './components/AccountView'
import { Dashboard, Home } from './components/Dashboard'
import { FieldMonitorTasks } from './components/FieldMonitorTasks'
import { GeoLocationView } from './components/GeoLocationView'
import { ProjectsView } from './components/Projects'
import { QRCodeView } from './components/QRCodeView'
import { TaskExample, TasksView } from './components/TasksView'
import { Test } from './components/Test'

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

const geolocationRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'geoLocation',
  component: () => <GeoLocationView />,
  errorComponent: () => 'Oh crap!'
})

const qrcodeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'qrCode',
  component: () => <QRCodeView />,
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

const fieldMonitorTree = new Route({
  getParentRoute: () => fieldMonitorTask,
  path: 'tree-removal',
  component: () => <TaskExample />,
  errorComponent: () => 'Oh crap!'
})

declare module '@tanstack/router' {
  interface Register {
    router: typeof router
  }
}

const testRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'test',
  component: () => <Test />,
  errorComponent: () => 'Oh crap!'
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  testRoute,
  projectsRoute,
  accountRoute,
  tasksRoute.addChildren([
    tasksHome,
    fieldMonitorTask.addChildren([fieldMonitorHome, fieldMonitorTree])
  ]),
  geolocationRoute,
  qrcodeRoute
])

export const router = new Router({
  routeTree: routeTree,
  defaultPreload: 'intent'
})
