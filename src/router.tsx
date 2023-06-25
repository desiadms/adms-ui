import { onlineManager } from '@tanstack/react-query'
import { RootRoute, Route, Router } from '@tanstack/router'
import request from 'graphql-request'
import { AccountView } from './components/AccountView'
import { Dashboard, Home } from './components/Dashboard'
import { GeoLocationView } from './components/GeoLocationView'
import { ProjectsView } from './components/Projects'
import { QRCodeView } from './components/QRCodeView'
import { TasksView } from './components/TasksView'
import { allTasksDocument } from './graphql-operations'
import { nhost, queryClient } from './helpers'

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

const tasksRoute = (isRestoring: boolean) =>
  new Route({
    getParentRoute: () => rootRoute,
    path: 'tasks',
    component: () => <TasksView />,
    errorComponent: () => 'Oh crap!',
    loader: async () =>
      queryClient.getQueryData(['allTasks']) ??
      // do not load if we are offline or hydrating because it returns a promise that is pending until we go online again
      // we just let the TasksView component handle it
      (onlineManager.isOnline() && !isRestoring
        ? queryClient.fetchQuery({
            queryKey: ['allTasks'],
            queryFn: () =>
              request(
                import.meta.env.VITE_HASURA_ENDPOINT,
                allTasksDocument,
                {},
                {
                  Authorization: `Bearer ${nhost.auth.getAccessToken()}`
                }
              )
          })
        : undefined)
  })

declare module '@tanstack/router' {
  interface Register {
    router: typeof router
  }
}

const routeTree = (isRestoring: boolean) =>
  rootRoute.addChildren([
    homeRoute,
    projectsRoute,
    accountRoute,
    tasksRoute(isRestoring),
    geolocationRoute,
    qrcodeRoute
  ])

export const router = (isRestoring: boolean) =>
  new Router({
    routeTree: routeTree(isRestoring),
    defaultPreload: 'intent'
  })
