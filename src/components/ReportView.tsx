import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'preact/hooks'
import { graphql } from '../gql'
import { useHasuraQuery } from '../helpers'

const allTasksDocument = graphql(/* GraphQL */ `
  query allTasks {
    tasks {
      name
      id
    }
  }
`)

export function ReportView() {
  const queryClient = useQueryClient()
  const [comment, setComment] = useState<string>()

  const { data, error, isLoading } = useHasuraQuery({
    document: allTasksDocument
  })

  console.log(error instanceof Error && error.message)

  const updateList = useMutation<
    Promise<string>,
    Promise<Error>,
    { text: string }
  >({
    mutationKey: ['mutation'],
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['allTasks'] })
      const previousData =
        queryClient.getQueryData<string[]>(['allTasks']) || []

      // remove local state so that server state is taken instead
      setComment(undefined)

      queryClient.setQueryData(['allTasks'], [...previousData, comment])

      return previousData
    },
    onError: (_, __, context) => {
      console.log('onError', context)
      // TODO: fix the context type. It should be the same as the return type of onMutate
      // queryClient.setQueryData(['data'], context?.previousData)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] })
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
      {data.tasks.map((item) => (
        <div key={item.id}>{JSON.stringify(item)}</div>
      ))}
    </div>
  )
}
