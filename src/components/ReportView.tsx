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
    { name: string },
    { tasks: { name: string }[] }
  >({
    mutationKey: ['mutation'],
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['allTasks'] })
      const previousData = queryClient.getQueryData<AllTasksQuery>([
        'allTasks'
      ]) || { tasks: [] }
      // remove local state so that server state is taken instead

      const id = Math.random()

      queryClient.setQueryData(['allTasks'], {
        tasks: [...previousData.tasks, { name: comment, id }]
      })

      return previousData
    },
    onError: (error, payload, previousData) => {
      // might try and store the payload somewhere to retry a mutation later
      console.log(error)

      console.log('in errors', payload)
      queryClient.setQueryData(['allTasks'], previousData)
    },
    onSettled: () => {
      console.log('in settled')

      queryClient.invalidateQueries({ queryKey: ['allTasks'] })
    }
  })

  function submitForm(event: Event) {
    event.preventDefault()
    console.log('in hereee!!!!', comment)
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
