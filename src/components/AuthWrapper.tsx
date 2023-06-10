import { useSignInEmailPassword } from '@nhost/react'
import { useIsRestoring } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/router'
import { useForm } from 'react-hook-form'
import { useAuth } from '../helpers'
import { router } from '../router'
import { Spinner } from './icons'

type LoginFormData = {
  id: string
  password: string
}

function convertToEmail(id: string) {
  return `${id}@desiadms.com`
}

function Login() {
  const { signInEmailPassword, isLoading, isError, error } =
    useSignInEmailPassword()

  const { register, handleSubmit } = useForm<LoginFormData>()

  async function onSubmit(data: LoginFormData) {
    const email = convertToEmail(data.id)
    await signInEmailPassword(email, data.password)
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
              htmlFor='id'
              className='block text-sm font-medium leading-6 text-gray-900'
            >
              Email address
            </div>
            <div className='mt-2'>
              <input
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-700 sm:text-sm sm:leading-6'
                type='text'
                autoComplete='id'
                {...register('id', { required: true })}
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

export function AuthWrapper() {
  const { isAuthenticated, isLoading } = useAuth()
  const isRestoring = useIsRestoring()

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

  return <RouterProvider router={router(isRestoring)} />
}
