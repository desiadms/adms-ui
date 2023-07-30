import { graphql } from './gql'

export const userDocument = graphql(/* GraphQL */ `
  query user {
    usersMetadata(limit: 1) {
      id
      first_name
      hire_date
      last_name
      role_data_manager
      role_field_supervisor
      role_filed_monitor
      role_operations_manager
      role_pc_admin
      role_project_manager
      usersMetadata_user {
        email
      }
    }
  }
`)

export const updateUserDocument = graphql(/* GraphQL */ `
  mutation updateUser($id: uuid!, $first_name: String!, $last_name: String!) {
    update_usersMetadata_by_pk(
      pk_columns: { id: $id }
      _set: { first_name: $first_name, last_name: $last_name }
    ) {
      id
    }
  }
`)

export const projectsDocument = graphql(/* GraphQL */ `
  query projects {
    projects {
      name
      comment
      contractor
      sub_contractor
      location
      poc
    }
  }
`)

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
