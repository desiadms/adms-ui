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
