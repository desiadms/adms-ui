import { Disclosure } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/20/solid'
import {
  useAuthenticationStatus,
  useSignInEmailPassword,
  useSignOut
} from '@nhost/react'
import { Link, Outlet, useMatchRoute } from '@tanstack/router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useForm } from 'react-hook-form'
import { Spinner } from './icons'

type LoginFormData = {
  email: string
  password: string
}

function Login() {
  const { signInEmailPassword, isLoading, isError, error } =
    useSignInEmailPassword()

  const { register, handleSubmit } = useForm<LoginFormData>()

  async function onSubmit(data: LoginFormData) {
    await signInEmailPassword(data.email, data.password)
  }

  return (
    <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
        <img
          className='mx-auto h-10 w-auto'
          src='https://tailwindui.com/img/logos/mark.svg?color=gray&shade=600'
          alt='Your Company'
        />
        <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
          Sign in to your account
        </h2>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-6'
          action='#'
          method='POST'
        >
          <div>
            <div
              htmlFor='email'
              className='block text-sm font-medium leading-6 text-gray-900'
            >
              Email address
            </div>
            <div className='mt-2'>
              <input
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6'
                type='email'
                autoComplete='email'
                {...register('email', { required: true })}
              />
            </div>
          </div>

          <div>
            <div className='flex items-center justify-between'>
              <div
                htmlFor='password'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                Password
              </div>
            </div>
            <div className='mt-2'>
              <input
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6'
                type='password'
                autoComplete='current-password'
                {...register('password', { required: true })}
              />
            </div>
          </div>
          <div>
            <button
              type='submit'
              className='flex w-full justify-center items-center rounded-md bg-gray-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700'
              disabled={isLoading}
            >
              Sign in
              {isLoading && (
                <Spinner
                  className='ml-2 h-4 w-4 text-white'
                  aria-hidden='true'
                />
              )}
            </button>
            {isError && (
              <div className='mt-2 text-center text-sm text-red-600'>
                {error?.message}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
}

const navigation = [
  ['/', 'Home'],
  ['/tasks', 'Tasks'],
  ['/geoLocation', 'GeoLocation'],
  ['/camera', 'Camera'],
  ['/qrCode', 'QRCode']
]
const userNavigation = [
  ['/profile', 'Profile'],
  ['/settings', 'Settings']
]

export function Home() {
  return (
    <div className='flex flex-col gap-4'>
      {navigation.slice(1).map(([to, label]) => (
        <Link key={to} to={to} className='block rounded-md px-3 py-2 text-base'>
          {label}
        </Link>
      ))}
    </div>
  )
}

export function Dashboard() {
  const matchRoute = useMatchRoute()

  const currentRoute = navigation.find(([to]) =>
    matchRoute({
      to,
      search: {},
      params: {}
    })
  )

  const routeLabel = currentRoute?.[1]

  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const { signOut } = useSignOut()

  if (isLoading) {
    return (
      <div className='absolute w-screen h-screen top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <div className='flex justify-center items-center h-full'>
          <Spinner />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <>
      <div className='min-h-full'>
        <nav>
          <Disclosure>
            {({ open }: { open: boolean }) => (
              <div className='bg-gray-800'>
                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                  <div className='flex h-16 items-center justify-between'>
                    <Link className='flex-shrink-0' to='/'>
                      <img
                        className='h-8 w-8'
                        src='https://tailwindui.com/img/logos/mark.svg?color=gray&shade=300'
                        alt='Your Company'
                      />
                    </Link>
                    <div className='-mr-2 flex'>
                      {/* Mobile menu button */}
                      <Disclosure.Button className='inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'>
                        <span className='sr-only'>Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className='block h-6 w-6'
                            aria-hidden='true'
                          />
                        ) : (
                          <Bars3Icon
                            className='block h-6 w-6'
                            aria-hidden='true'
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>

                <Disclosure.Panel>
                  {({ close }: { close: () => void }) => (
                    <>
                      <div className='space-y-1 px-2 pb-3 pt-2 sm:px-3'>
                        {navigation.slice(1).map(([to, label]) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={close}
                            activeProps={{
                              className: `bg-gray-900 text-white`
                            }}
                            inactiveProps={{
                              className: `text-gray-300 hover:bg-gray-700 hover:text-white`
                            }}
                            className='block rounded-md px-3 py-2 text-base'
                          >
                            {label}
                          </Link>
                        ))}
                      </div>
                      <div className='border-t border-gray-700 pb-3 pt-4'>
                        <div className='flex items-center px-5'>
                          <div className='flex-shrink-0'>
                            <img
                              className='h-10 w-10 rounded-full'
                              src={user.imageUrl}
                              alt=''
                            />
                          </div>
                          <div className='ml-3 flex flex-col gap-1'>
                            <div className='text-base font-medium leading-none text-white'>
                              {user.name}
                            </div>
                            <div className='text-sm font-light leading-none text-gray-400'>
                              {user.email}
                            </div>
                          </div>
                          <button
                            type='button'
                            className='ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'
                          >
                            <span className='sr-only'>View notifications</span>
                            <BellIcon className='h-6 w-6' aria-hidden='true' />
                          </button>
                        </div>
                        <div className='mt-3 space-y-1 px-2'>
                          {userNavigation.map(([to, label]) => (
                            <Link
                              key={to}
                              to={to}
                              className='block rounded-md px-3 py-2 text-base text-gray-400 hover:bg-gray-400 hover:bg-opacity-75 hover:text-white'
                            >
                              {label}
                            </Link>
                          ))}
                          <Link
                            className='block rounded-md px-3 py-2 text-base text-gray-400 hover:bg-gray-400 hover:bg-opacity-75 hover:text-white'
                            onClick={signOut}
                            to='/'
                          >
                            Sign out
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        </nav>

        <header className='bg-white shadow-sm'>
          {currentRoute?.[0] !== '/' && (
            <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
              <h1 className='text-lg font-semibold leading-6 text-gray-900'>
                {routeLabel || 'No Route Found'}
              </h1>
            </div>
          )}
        </header>
        <main>
          <div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
            <Outlet />
          </div>
        </main>
      </div>

      <TanStackRouterDevtools initialIsOpen={false} position='bottom-left' />
    </>
  )
}
