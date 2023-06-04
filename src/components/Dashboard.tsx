import { Disclosure } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useSignOut } from '@nhost/react'
import { Link, Outlet, useMatchRoute } from '@tanstack/router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

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
  ['/qrCode', 'QRCode'],
  ['/report', 'Report']
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

  const { signOut } = useSignOut()

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
