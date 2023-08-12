import { graphql } from '../gql'

export const queryTreeRemovalTasks = graphql(/* GraphQL */ `
  query treeRemovalTasks {
    tasks_tree_removal {
      comment
      completed
      created_at
      updated_at
      id
      images: tasks_tree_removal_images {
        id
        created_at
        latitude
        longitude
        ranges
        taken_at_step
      }
    }
  }
`)

export const upsertTreeRemovalTasks = graphql(/* GraphQL */ `
  mutation upsertTreeRemovalTask(
    $tasks: [tasks_tree_removal_insert_input!]!
    $images: [images_insert_input!]!
  ) {
    insert_tasks_tree_removal(
      objects: $tasks
      on_conflict: {
        update_columns: [comment, completed, updated_at, _deleted]
        constraint: tree_removal_tasks_pkey
      }
    ) {
      returning {
        id
      }
    }
    insert_images(
      objects: $images
      on_conflict: {
        constraint: images_pkey
        update_columns: [
          latitude
          longitude
          ranges
          taken_at_step
          updated_at
          _deleted
        ]
      }
    ) {
      returning {
        id
      }
    }
  }
`)

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
      id
      name
      comment
      contractor
      sub_contractor
      location
      poc
    }
  }
`)
