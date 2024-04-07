import { graphql } from "../graphql";

export const queryTreeRemovalTasks = graphql(/* GraphQL */ `
  query TreeRemovalTasks {
    tasks_tree_removal(where: { completed: { _neq: true } }) {
      comment
      completed
      created_at
      updated_at
      id
      ranges
      images: tasks_tree_removal_images {
        id
        created_at
        latitude
        longitude
        taken_at_step
        base64Preview
        _deleted
      }
    }
  }
`);

export const upsertTreeRemovalTasks = graphql(/* GraphQL */ `
  mutation UpsertTreeRemovalTask(
    $tasks: [tasks_tree_removal_insert_input!]!
    $images: [images_insert_input!]!
  ) {
    insert_tasks_tree_removal(
      objects: $tasks
      on_conflict: {
        update_columns: [comment, completed, updated_at, _deleted, ranges]
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
`);

export const queryStumpRemovalTasks = graphql(/* GraphQL */ `
  query StumpRemovalTasks {
    tasks_stump_removal(where: { completed: { _neq: true } }) {
      comment
      completed
      created_at
      updated_at
      id
      images: tasks_stump_removal_images {
        id
        created_at
        latitude
        longitude
        taken_at_step
        base64Preview
        _deleted
      }
    }
  }
`);

export const upsertStumpRemovalTasks = graphql(/* GraphQL */ `
  mutation UpsertStumpRemovalTask(
    $tasks: [tasks_stump_removal_insert_input!]!
    $images: [images_insert_input!]!
  ) {
    insert_tasks_stump_removal(
      objects: $tasks
      on_conflict: {
        update_columns: [comment, completed, updated_at, _deleted]
        constraint: tasks_stump_removal_pkey
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
`);

export const queryTicketingTasks = graphql(/* GraphQL */ `
  query TicketingTasks {
    tasks_ticketing {
      comment
      created_at
      updated_at
      id
      latitude
      longitude
      name
      images {
        id
        created_at
        latitude
        longitude
        base64Preview
        _deleted
      }
    }
  }
`);

export const userDocument = graphql(/* GraphQL */ `
  query User {
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
`);

export const updateUserDocument = graphql(/* GraphQL */ `
  mutation UpdateUser($id: uuid!, $first_name: String!, $last_name: String!) {
    update_usersMetadata_by_pk(
      pk_columns: { id: $id }
      _set: { first_name: $first_name, last_name: $last_name }
    ) {
      id
    }
  }
`);

export const projectsDocument = graphql(/* GraphQL */ `
  query Projects {
    projects {
      id
      name
      comment
      contractor
      status
      sub_contractor
      location
      poc
      ticketing_names {
        id
        name
        add_photos
        comment
        print_ticket
      }
    }
  }
`);
