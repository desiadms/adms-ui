import { UseQueryResult } from '@tanstack/react-query'
import { Spinner } from './icons'

export function QueryStates<T>({ isLoading, error }: UseQueryResult<T, Error>) {
  return (
    <div className='flex place-content-center'>
      {isLoading && <Spinner className='h-6 w-6 text-black' />}
      {error && <div className='text-red-600'>{error.message}</div>}
    </div>
  )
}

export function Dot() {
  return <div className='h-1 w-1 bg-neutral-400 rounded-full' />
}
