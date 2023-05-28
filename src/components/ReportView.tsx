import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'preact/hooks'
import { fetchData } from '../reactQuery'

export function ReportView() {
  const queryClient = useQueryClient()
  const [comment, setComment] = useState<string>()

  const { isLoading, error, data } = useQuery<string[], Error>({
    queryKey: ['data'],
    queryFn: fetchData
  })

  console.log(error instanceof Error && error.message)

  const updateList = useMutation<
    Promise<string>,
    Promise<Error>,
    { text: string }
  >({
    mutationKey: ['mutation'],
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['data'] })
      const previousData = queryClient.getQueryData<string[]>(['data']) || []

      // remove local state so that server state is taken instead
      setComment(undefined)

      queryClient.setQueryData(['data'], [...previousData, comment])

      return previousData
    },
    onError: (_, __, context) => {
      console.log('onError', context)
      // TODO: fix the context type. It should be the same as the return type of onMutate
      // queryClient.setQueryData(['data'], context?.previousData)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] })
    }
  })

  function submitForm(event: Event) {
    event.preventDefault()
    if (comment) updateList.mutate({ text: comment })
  }

  if (isLoading) return <>Is Loading</>

  if (error) return <>`An error has occurred: ${error.message}`</>

  return (
    <div className='bg-green-800'>
      <form onSubmit={submitForm}>
        <label htmlFor='comment'>
          Comment
          <input
            name='comment'
            value={comment}
            onChange={(event) => {
              const { target } = event
              if (target) setComment((target as HTMLInputElement).value)
            }}
          />
        </label>
      </form>
      {data.map((item) => (
        <div key={item}>{item}</div>
      ))}
    </div>
  )
}
