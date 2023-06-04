import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'preact/hooks'
import { AllTasksQuery } from 'src/gql/graphql'
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

  const { data } = useHasuraQuery({
    document: allTasksDocument
  })

  const updateList = useMutation<
    Promise<{ name: string }[]>,
    Promise<Error>,
    { name: string }
  >({
    mutationKey: ['mutation'],
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['allTasks'] })
      const previousData = queryClient.getQueryData<AllTasksQuery>([
        'allTasks'
      ]) || { tasks: [] }
      // remove local state so that server state is taken instead
      setComment(undefined)

      queryClient.setQueryData(['a'], {
        tasks: [...previousData.tasks, comment]
      })

      return previousData
    },
    onError: (_, __, context) => {
      console.log('in error', context)
      // TODO: fix the context type. It should be the same as the return type of onMutate
      // queryClient.setQueryData(['allTasks'], context?.previousData)
    },
    onSettled: () => {
      console.log('in settled')

      queryClient.invalidateQueries({ queryKey: ['allTasks'] })
    }
  })

  function submitForm(event: Event) {
    event.preventDefault()
    if (comment) updateList.mutate({ name: comment })
  }

  return (
    <div className='bg-green-400'>
      <form onSubmit={submitForm} className='flex flex-col items-start'>
        <label htmlFor='comment'>
          Comment
          <br />
          <input
            name='comment'
            value={comment}
            onChange={(event) => {
              const { target } = event
              if (target) setComment((target as HTMLInputElement).value)
            }}
          />
        </label>
        <button type='submit'> submit shit</button>
        {data &&
          data?.tasks?.map((el) => <div key={el.id}>{JSON.stringify(el)}</div>)}
      </form>
    </div>
  )
}
