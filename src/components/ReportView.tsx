import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'preact/hooks'
import { graphql } from '../gql'
import { useHasuraMutation, useHasuraQuery } from '../helpers'

const allTasksDocument = graphql(/* GraphQL */ `
  query allTasks {
    tasks {
      name
      id
    }
  }
`)

export function ReportView() {
  const [comment, setComment] = useState<string>()

  const { data } = useHasuraQuery({
    queryKey: ['tasks'],
    document: allTasksDocument
  })

  const updateList = useHasuraMutation({
    queryKey: ['tasks'],
    mutationKey: ['createTask']
  })

  function submitForm(event: Event) {
    event.preventDefault()
    if (comment) updateList.mutate({ name: comment })
  }

  const queryClient = useQueryClient()
  const mutationCache = queryClient.getMutationCache().getAll()
  return (
    <div className='bg-green-300'>
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
      </form>

      {data &&
        data?.tasks?.map((el) => <div key={el.id}>{JSON.stringify(el)}</div>)}

      {mutationCache?.map(({ state }) => {
        const { context, ...rest } = state
        return <pre>{JSON.stringify(rest, null, 2)}</pre>
      })}
    </div>
  )
}
