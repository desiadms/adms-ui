import { graphql } from '../gql'

export const allTasksDocument = graphql(/* GraphQL */ `
  query allTasks {
    tasks {
      id
      name
      updated_at
      created_at
      _deleted
      tasks_images {
        id
        task_id
      }
    }
  }
`)

export const createTasksDocument = graphql(/* GraphQL */ `
  mutation tasks(
    $tasks_images: [images_insert_input!]!
    $tasks: [tasks_insert_input!]!
  ) {
    insert_tasks(objects: $tasks) {
      returning {
        id
      }
    }
    insert_images(objects: $tasks_images) {
      returning {
        id
        task_id
      }
    }
  }
`)
