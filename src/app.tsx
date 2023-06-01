import { NhostProvider } from '@nhost/react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { RouterProvider } from '@tanstack/router'
import { StrictMode } from 'preact/compat'
import { Toaster } from 'react-hot-toast'
import './app.css'
import { nhost } from './helpers'
import { persister, queryClient } from './reactQuery'
import { router } from './router'

export function App() {
  return (
    <StrictMode>
      <NhostProvider nhost={nhost}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
          onSuccess={() => {
            // resume mutations after initial restore from IDB was successful
            queryClient.resumePausedMutations().then(() => {
              queryClient.invalidateQueries()
            })
          }}
        >
          <RouterProvider router={router} />
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} position='bottom-right' />
        </PersistQueryClientProvider>
      </NhostProvider>
    </StrictMode>
  )
}
