import { graphql } from "../graphql";

export const queryImages = graphql(/* GraphQL */ `
  query Images {
    images {
      id
      created_at
      updated_at
      latitude
      longitude
      taken_at_step
      base64Preview
      _deleted
    }
  }
`);

export const queryTreeRemovalTasks = graphql(/* GraphQL */ `
  query TreeRemovalTasks {
    tasks_tree_removal(where: { completed: { _neq: true } }) {
      comment
      completed
      _deleted
      created_at
      updated_at
      id
      ranges
      images: tasks_tree_removal_images {
        id
        created_at
        updated_at
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
    $taskIds: [task_ids_insert_input!]!
  ) {
    insert_task_ids(
      objects: $taskIds
      on_conflict: { constraint: task_ids_pkey, update_columns: id }
    ) {
      returning {
        id
      }
    }
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
      _deleted
      id
      images: tasks_stump_removal_images {
        id
        created_at
        updated_at
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
    $taskIds: [task_ids_insert_input!]!
  ) {
    insert_task_ids(
      objects: $taskIds
      on_conflict: { constraint: task_ids_pkey, update_columns: id }
    ) {
      returning {
        id
      }
    }
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
      _deleted
      id
      latitude
      longitude
      ticketing_name
      task_ticketing_name {
        name
      }
      images {
        id
        created_at
        updated_at
        latitude
        longitude
        base64Preview
        _deleted
      }
    }
  }
`);

export const upsertTicketingTasks = graphql(/* GraphQL */ `
  mutation UpsertTicketingTask(
    $tasks: [tasks_ticketing_insert_input!]!
    $images: [images_insert_input!]!
    $taskIds: [task_ids_insert_input!]!
  ) {
    insert_task_ids(
      objects: $taskIds
      on_conflict: { constraint: task_ids_pkey, update_columns: id }
    ) {
      returning {
        id
      }
    }
    insert_tasks_ticketing(
      objects: $tasks
      on_conflict: {
        update_columns: [comment, updated_at, _deleted]
        constraint: task_admin_pkey
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
        update_columns: [latitude, longitude, updated_at, _deleted]
      }
    ) {
      returning {
        id
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

export const queryContractors = graphql(/* GraphQL */ `
  query Contractors {
    contractors {
      id
      name
    }
  }
`);

export const queryTrucks = graphql(/* GraphQL */ `
  query Trucks {
    trucks {
      truck_number
      id
    }
  }
`);

export const queryDisposalSites = graphql(/* GraphQL */ `
  query DisposalSites {
    disposal_sites {
      id
      name
    }
  }
`);

export const queryDebrisTypes = graphql(/* GraphQL */ `
  query DebrisTypes {
    debris_types {
      id
      name
    }
  }
`);

export const queryCollectionTasks = graphql(/* GraphQL */ `
  query CollectionTasks {
    tasks_collection {
      created_at
      comment
      capacity
      contractor
      debris_type
      id
      _deleted
      latitude
      longitude
      truck_id
      updated_at
      weigh_points
      images: tasks_collection_images {
        id
        created_at
        updated_at
        latitude
        longitude
        taken_at_step
        base64Preview
        _deleted
      }
    }
  }
`);

export const upsertCollectionTasks = graphql(/* GraphQL */ `
  mutation UpsertCollectionTask(
    $tasks: [tasks_collection_insert_input!]!
    $images: [images_insert_input!]!
    $taskIds: [task_ids_insert_input!]!
  ) {
    insert_task_ids(objects: $taskIds) {
      returning {
        id
      }
    }

    insert_tasks_collection(
      objects: $tasks
      on_conflict: {
        update_columns: [comment, updated_at, _deleted]
        constraint: tasks_collection_pkey
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
        update_columns: [latitude, longitude, updated_at, _deleted]
      }
    ) {
      returning {
        id
      }
    }
  }
`);

export const queryDisposalTasks = graphql(/* GraphQL */ `
  query DisposalTasks {
    tasks_disposal {
      created_at
      comment
      capacity
      _deleted
      contractor
      debris_type
      disposal_site
      id
      latitude
      longitude
      truck_id
      updated_at
      load_call
      task_collection_id
      images: tasks_disposal_images {
        id
        created_at
        updated_at
        latitude
        longitude
        taken_at_step
        base64Preview
        _deleted
      }
    }
  }
`);

export const upsertDisposalTasks = graphql(/* GraphQL */ `
  mutation UpsertDisposalTask(
    $tasks: [tasks_disposal_insert_input!]!
    $images: [images_insert_input!]!
    $taskIds: [task_ids_insert_input!]!
  ) {
    insert_task_ids(objects: $taskIds) {
      returning {
        id
      }
    }

    insert_tasks_disposal(
      objects: $tasks
      on_conflict: {
        update_columns: [comment, updated_at, _deleted]
        constraint: tasks_disposal_pkey
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
        update_columns: [latitude, longitude, updated_at, _deleted]
      }
    ) {
      returning {
        id
      }
    }
  }
`);

export const upsertLogs = graphql(/* GraphQL */ `
  mutation UpsertLogs($objects: [logs_insert_input!]!) {
    insert_logs(
      objects: $objects
      on_conflict: { constraint: logs_pkey, update_columns: [data] }
    ) {
      affected_rows
    }
  }
`);

export const queryAllTaskIds = graphql(/* GraphQL */ `
  query AllTaskIds {
    task_ids {
      id
      comment
    }
  }
`);

export const upsertImageUnsynced = graphql(/* GraphQL */ `
  mutation UpsertImageUnsynched($object: images_unsynched_insert_input!) {
    insert_images_unsynched_one(
      object: $object
      on_conflict: {
        constraint: images_unsynched_pkey
        update_columns: [base64, task_id]
      }
    ) {
      id
    }
  }
`);
