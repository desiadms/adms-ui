import { useSignInEmailPassword } from '@nhost/react'
import { useIsRestoring } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/router'
import { useMemo } from 'preact/hooks'
import { useForm } from 'react-hook-form'
import { useAuth } from '../helpers'
import { router } from '../router'
import { Button, Error, LabelledInput } from './Forms'
import { Spinner } from './icons'

type LoginFormData = {
  id: string
  password: string
}

function convertToEmail(id: string) {
  return `${id}@desiadms.com`
}

function Login() {
  const { signInEmailPassword, isLoading, isError } = useSignInEmailPassword()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

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
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div>
            <LabelledInput
              label='User ID'
              type='text'
              {...register('id', { required: 'User ID is required' })}
            />
            <Error message={errors.id?.message} />
          </div>

          <div>
            <LabelledInput
              label='Password'
              type='password'
              {...register('password', { required: 'Password is required' })}
            />
            <Error message={errors.password?.message} />
          </div>
          <div>
            <Button disabled={isLoading} type='submit'>
              Sign in
              {isLoading && (
                <Spinner className='h-4 w-4 text-white' aria-hidden='true' />
              )}
            </Button>
            {isError && <Error message='Invalid user ID or password' />}
          </div>
        </form>
      </div>
    </div>
  )
}

export function AuthWrapper() {
  const { isAuthenticated, isLoading } = useAuth()
  const isRestoring = useIsRestoring()

  const memoizedRoutes = useMemo(() => router(isRestoring), [isRestoring])

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

  return <RouterProvider router={memoizedRoutes} />
}
