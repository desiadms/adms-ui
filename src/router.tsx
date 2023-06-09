import { onlineManager } from '@tanstack/react-query'
import { RootRoute, Route, Router } from '@tanstack/router'
import request from 'graphql-request'
import { CameraView } from './components/CameraView'
import { Dashboard, Home } from './components/Dashboard'
import { GeoLocationView } from './components/GeoLocationView'
import { QRCodeView } from './components/QRCodeView'
import { ReportView, allTasksDocument } from './components/ReportView'
import { Tasks } from './components/Tasks'
import { nhost, queryClient } from './helpers'

const rootRoute = new RootRoute({
  component: () => <Dashboard />
})

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'home',
  component: () => <Home />,
  errorComponent: () => 'Oh crap!'
})

const tasksRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'tasks',
  component: () => <Tasks />,
  errorComponent: () => 'Oh crap!'
})

const geolocationRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'geoLocation',
  component: () => <GeoLocationView />,
  errorComponent: () => 'Oh crap!'
})

const cameraRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'camera',
  component: () => <CameraView />,
  errorComponent: () => 'Oh crap!'
})

const qrcodeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'qrCode',
  component: () => <QRCodeView />,
  errorComponent: () => 'Oh crap!'
})

const reportRoute = (isRestoring: boolean) =>
  new Route({
    getParentRoute: () => rootRoute,
    path: 'report',
    component: () => <ReportView />,
    errorComponent: () => 'Oh crap!',
    loader: async () =>
      queryClient.getQueryData(['tasks']) ??
      // do not load if we are offline or hydrating because it returns a promise that is pending until we go online again
      // we just let the Detail component handle it
      (onlineManager.isOnline() && !isRestoring
        ? queryClient.fetchQuery({
            queryKey: ['tasks'],
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
    reportRoute(isRestoring),
    tasksRoute,
    geolocationRoute,
    cameraRoute,
    qrcodeRoute
  ])

export const router = (isRestoring: boolean) =>
  new Router({
    routeTree: routeTree(isRestoring),
    defaultPreload: 'intent'
  })
