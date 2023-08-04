import { NhostProvider } from '@nhost/react'
import { StrictMode } from 'preact/compat'
import { Toaster } from 'react-hot-toast'
import './app.css'
import { AuthWrapper } from './components/AuthWrapper'
import { nhost } from './utils'

export function App() {
  return (
    <StrictMode>
      <NhostProvider nhost={nhost}>
        <AuthWrapper />
        <Toaster />
      </NhostProvider>
    </StrictMode>
  )
}
