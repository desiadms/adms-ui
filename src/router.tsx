import { RootRoute, Route, Router } from '@tanstack/router'
import { CameraView } from './components/CameraView'
import { Dashboard, Home } from './components/Dashboard'
import { GeoLocationView } from './components/GeoLocationView'
import { QRCodeView } from './components/QRCodeView'
import { ReportView } from './components/ReportView'
import { Tasks } from './components/Tasks'

const rootRoute = new RootRoute({
  component: () => <Dashboard />
})

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'home',
  component: () => <Home />,
  errorComponent: () => 'Oh crap!'
})

const reportRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'report',
  component: () => <ReportView />,
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

declare module '@tanstack/router' {
  interface Register {
    router: typeof router
  }
}

const routeTree = rootRoute.addChildren([
  homeRoute,
  reportRoute,
  tasksRoute,
  geolocationRoute,
  cameraRoute,
  qrcodeRoute
])

export const router = new Router({
  routeTree,
  defaultPreload: 'intent'
})
