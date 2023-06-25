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
  mutation updateUser(
    $id: uuid!
    $address: String!
    $first_name: String!
    $last_name: String!
  ) {
    update_usersMetadata_by_pk(
      pk_columns: { id: $id }
      _set: {
        address: $address
        first_name: $first_name
        last_name: $last_name
      }
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
      tasks_images {
        id
        task_id
      }
    }
  }
`)

export const createTaskDocument = graphql(/* GraphQL */ `
  mutation task(
    $name: String
    $task_id: uuid
    $images: [images_insert_input!]!
  ) {
    insert_tasks_one(object: { name: $name, id: $task_id }) {
      id
      name
      user_id
    }
    insert_images(objects: $images) {
      returning {
        id
        task_id
      }
    }
  }
`)
