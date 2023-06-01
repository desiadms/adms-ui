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

export function Tasks() {
  const { data } = useHasuraQuery({ document: allTasksDocument })

  return <div className='p-2'>{JSON.stringify(data)}</div>
}
