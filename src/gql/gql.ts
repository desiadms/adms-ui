/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query treeRemovalTasks {\n    tasks_tree_removal(where: { completed: { _neq: true } }) {\n      comment\n      completed\n      created_at\n      updated_at\n      id\n      ranges\n      images: tasks_tree_removal_images {\n        id\n        created_at\n        latitude\n        longitude\n        taken_at_step\n      }\n    }\n  }\n": types.TreeRemovalTasksDocument,
    "\n  mutation upsertTreeRemovalTask(\n    $tasks: [tasks_tree_removal_insert_input!]!\n    $images: [images_insert_input!]!\n  ) {\n    insert_tasks_tree_removal(\n      objects: $tasks\n      on_conflict: {\n        update_columns: [comment, completed, updated_at, _deleted, ranges]\n        constraint: tree_removal_tasks_pkey\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n    insert_images(\n      objects: $images\n      on_conflict: {\n        constraint: images_pkey\n        update_columns: [\n          latitude\n          longitude\n          taken_at_step\n          updated_at\n          _deleted\n        ]\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n  }\n": types.UpsertTreeRemovalTaskDocument,
    "\n  query stumpRemovalTasks {\n    tasks_stump_removal(where: { completed: { _neq: true } }) {\n      comment\n      completed\n      created_at\n      updated_at\n      id\n      images: tasks_stump_removal_images {\n        id\n        created_at\n        latitude\n        longitude\n        taken_at_step\n      }\n    }\n  }\n": types.StumpRemovalTasksDocument,
    "\n  mutation upsertStumpRemovalTask(\n    $tasks: [tasks_stump_removal_insert_input!]!\n    $images: [images_insert_input!]!\n  ) {\n    insert_tasks_stump_removal(\n      objects: $tasks\n      on_conflict: {\n        update_columns: [comment, completed, updated_at, _deleted]\n        constraint: tasks_stump_removal_pkey\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n    insert_images(\n      objects: $images\n      on_conflict: {\n        constraint: images_pkey\n        update_columns: [\n          latitude\n          longitude\n          taken_at_step\n          updated_at\n          _deleted\n        ]\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n  }\n": types.UpsertStumpRemovalTaskDocument,
    "\n  query user {\n    usersMetadata(limit: 1) {\n      id\n      first_name\n      hire_date\n      last_name\n      role_data_manager\n      role_field_supervisor\n      role_filed_monitor\n      role_operations_manager\n      role_pc_admin\n      role_project_manager\n      usersMetadata_user {\n        email\n      }\n    }\n  }\n": types.UserDocument,
    "\n  mutation updateUser($id: uuid!, $first_name: String!, $last_name: String!) {\n    update_usersMetadata_by_pk(\n      pk_columns: { id: $id }\n      _set: { first_name: $first_name, last_name: $last_name }\n    ) {\n      id\n    }\n  }\n": types.UpdateUserDocument,
    "\n  query projects {\n    projects {\n      id\n      name\n      comment\n      contractor\n      sub_contractor\n      location\n      poc\n    }\n  }\n": types.ProjectsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query treeRemovalTasks {\n    tasks_tree_removal(where: { completed: { _neq: true } }) {\n      comment\n      completed\n      created_at\n      updated_at\n      id\n      ranges\n      images: tasks_tree_removal_images {\n        id\n        created_at\n        latitude\n        longitude\n        taken_at_step\n      }\n    }\n  }\n"): (typeof documents)["\n  query treeRemovalTasks {\n    tasks_tree_removal(where: { completed: { _neq: true } }) {\n      comment\n      completed\n      created_at\n      updated_at\n      id\n      ranges\n      images: tasks_tree_removal_images {\n        id\n        created_at\n        latitude\n        longitude\n        taken_at_step\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation upsertTreeRemovalTask(\n    $tasks: [tasks_tree_removal_insert_input!]!\n    $images: [images_insert_input!]!\n  ) {\n    insert_tasks_tree_removal(\n      objects: $tasks\n      on_conflict: {\n        update_columns: [comment, completed, updated_at, _deleted, ranges]\n        constraint: tree_removal_tasks_pkey\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n    insert_images(\n      objects: $images\n      on_conflict: {\n        constraint: images_pkey\n        update_columns: [\n          latitude\n          longitude\n          taken_at_step\n          updated_at\n          _deleted\n        ]\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation upsertTreeRemovalTask(\n    $tasks: [tasks_tree_removal_insert_input!]!\n    $images: [images_insert_input!]!\n  ) {\n    insert_tasks_tree_removal(\n      objects: $tasks\n      on_conflict: {\n        update_columns: [comment, completed, updated_at, _deleted, ranges]\n        constraint: tree_removal_tasks_pkey\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n    insert_images(\n      objects: $images\n      on_conflict: {\n        constraint: images_pkey\n        update_columns: [\n          latitude\n          longitude\n          taken_at_step\n          updated_at\n          _deleted\n        ]\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query stumpRemovalTasks {\n    tasks_stump_removal(where: { completed: { _neq: true } }) {\n      comment\n      completed\n      created_at\n      updated_at\n      id\n      images: tasks_stump_removal_images {\n        id\n        created_at\n        latitude\n        longitude\n        taken_at_step\n      }\n    }\n  }\n"): (typeof documents)["\n  query stumpRemovalTasks {\n    tasks_stump_removal(where: { completed: { _neq: true } }) {\n      comment\n      completed\n      created_at\n      updated_at\n      id\n      images: tasks_stump_removal_images {\n        id\n        created_at\n        latitude\n        longitude\n        taken_at_step\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation upsertStumpRemovalTask(\n    $tasks: [tasks_stump_removal_insert_input!]!\n    $images: [images_insert_input!]!\n  ) {\n    insert_tasks_stump_removal(\n      objects: $tasks\n      on_conflict: {\n        update_columns: [comment, completed, updated_at, _deleted]\n        constraint: tasks_stump_removal_pkey\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n    insert_images(\n      objects: $images\n      on_conflict: {\n        constraint: images_pkey\n        update_columns: [\n          latitude\n          longitude\n          taken_at_step\n          updated_at\n          _deleted\n        ]\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation upsertStumpRemovalTask(\n    $tasks: [tasks_stump_removal_insert_input!]!\n    $images: [images_insert_input!]!\n  ) {\n    insert_tasks_stump_removal(\n      objects: $tasks\n      on_conflict: {\n        update_columns: [comment, completed, updated_at, _deleted]\n        constraint: tasks_stump_removal_pkey\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n    insert_images(\n      objects: $images\n      on_conflict: {\n        constraint: images_pkey\n        update_columns: [\n          latitude\n          longitude\n          taken_at_step\n          updated_at\n          _deleted\n        ]\n      }\n    ) {\n      returning {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query user {\n    usersMetadata(limit: 1) {\n      id\n      first_name\n      hire_date\n      last_name\n      role_data_manager\n      role_field_supervisor\n      role_filed_monitor\n      role_operations_manager\n      role_pc_admin\n      role_project_manager\n      usersMetadata_user {\n        email\n      }\n    }\n  }\n"): (typeof documents)["\n  query user {\n    usersMetadata(limit: 1) {\n      id\n      first_name\n      hire_date\n      last_name\n      role_data_manager\n      role_field_supervisor\n      role_filed_monitor\n      role_operations_manager\n      role_pc_admin\n      role_project_manager\n      usersMetadata_user {\n        email\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation updateUser($id: uuid!, $first_name: String!, $last_name: String!) {\n    update_usersMetadata_by_pk(\n      pk_columns: { id: $id }\n      _set: { first_name: $first_name, last_name: $last_name }\n    ) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation updateUser($id: uuid!, $first_name: String!, $last_name: String!) {\n    update_usersMetadata_by_pk(\n      pk_columns: { id: $id }\n      _set: { first_name: $first_name, last_name: $last_name }\n    ) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query projects {\n    projects {\n      id\n      name\n      comment\n      contractor\n      sub_contractor\n      location\n      poc\n    }\n  }\n"): (typeof documents)["\n  query projects {\n    projects {\n      id\n      name\n      comment\n      contractor\n      sub_contractor\n      location\n      poc\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;