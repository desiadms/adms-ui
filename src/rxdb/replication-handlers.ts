import { resolveRequestDocument } from "graphql-request";
import * as R from "remeda";
import { RxReplicationWriteToMasterRow } from "rxdb";
import { extractFilesAndSaveToNhost } from "../hooks";
import {
  projectsDocument,
  queryCollectionTasks,
  queryContractors,
  queryDebrisTypes,
  queryDisposalSites,
  queryStumpRemovalTasks,
  queryTicketingTasks,
  queryTreeRemovalTasks,
  queryTrucks,
  updateUserDocument,
  upsertCollectionTasks,
  upsertStumpRemovalTasks,
  upsertTicketingTasks,
  upsertTreeRemovalTasks,
  userDocument,
} from "./graphql-operations";
import {
  CollectionTaskDocType,
  StumpRemovalTaskDocType,
  TicketingTaskDocType,
  TreeRemovalTaskDocType,
  UserDocType,
} from "./rxdb-schemas";

export function treeRemovalTasksRead() {
  return {
    query: resolveRequestDocument(queryTreeRemovalTasks).query,
    variables: {},
  };
}

export async function treeRemovalTasksWrite(
  _db,
  rows: RxReplicationWriteToMasterRow<TreeRemovalTaskDocType>[],
) {
  const extractedData = rows.map(({ newDocumentState }) => newDocumentState);
  const images = extractedData
    .map(({ images, id }) => images.map((image) => ({ ...image, task_id: id })))
    .flat();

  await extractFilesAndSaveToNhost(images);

  const variableImages = images.map((image) =>
    R.omit(image, ["base64Preview"]),
  );
  const variableTasks = extractedData.map((task) => R.omit(task, ["images"]));
  const taskIds = extractedData.map(({ id }) => ({ id }));

  return {
    query: resolveRequestDocument(upsertTreeRemovalTasks).query,
    variables: { tasks: variableTasks, images: variableImages, taskIds },
  };
}

export function stumpRemovalTasksRead() {
  return {
    query: resolveRequestDocument(queryStumpRemovalTasks).query,
    variables: {},
  };
}

export async function stumpRemovalTasksWrite(
  _db,
  rows: RxReplicationWriteToMasterRow<StumpRemovalTaskDocType>[],
) {
  const extractedData = rows.map(({ newDocumentState }) => newDocumentState);
  const images = extractedData
    .map(({ images, id }) => images.map((image) => ({ ...image, task_id: id })))
    .flat();

  await extractFilesAndSaveToNhost(images);

  const variableImages = images.map((image) =>
    R.omit(image, ["base64Preview"]),
  );
  const variableTasks = extractedData.map((task) => R.omit(task, ["images"]));
  const taskIds = extractedData.map(({ id }) => ({ id }));

  return {
    query: resolveRequestDocument(upsertStumpRemovalTasks).query,
    variables: { tasks: variableTasks, images: variableImages, taskIds },
  };
}

export function ticketingTasksRead() {
  return {
    query: resolveRequestDocument(queryTicketingTasks).query,
    variables: {},
  };
}

export async function ticketingTasksWrite(
  _db,
  rows: RxReplicationWriteToMasterRow<TicketingTaskDocType>[],
) {
  const extractedData = rows.map(({ newDocumentState }) => newDocumentState);
  const images = extractedData
    .map(({ images, id }) =>
      images?.map((image) => ({ ...image, task_id: id })),
    )
    .flat();

  if (images.every((image) => image)) await extractFilesAndSaveToNhost(images);

  const variableImages = images?.map((image) =>
    R.omit(image, ["base64Preview"]),
  );
  const variableTasks = extractedData.map((task) => R.omit(task, ["images"]));
  const taskIds = extractedData.map(({ id }) => ({ id }));

  return {
    query: resolveRequestDocument(upsertTicketingTasks).query,
    variables: { tasks: variableTasks, images: variableImages, taskIds },
  };
}

export function userRead() {
  return {
    query: resolveRequestDocument(userDocument).query,
    variables: {},
  };
}

export function userWrite(
  _db,
  rows: RxReplicationWriteToMasterRow<UserDocType>[],
) {
  const extractedData = rows.map(({ newDocumentState }) => newDocumentState);
  const user = extractedData[0];

  return {
    query: resolveRequestDocument(updateUserDocument).query,
    variables: {
      id: user?.id,
      first_name: user?.first_name,
      last_name: user?.last_name,
    },
  };
}

export function projectRead() {
  return {
    query: resolveRequestDocument(projectsDocument).query,
    variables: {},
  };
}

export function contractorsRead() {
  return {
    query: resolveRequestDocument(queryContractors).query,
    variables: {},
  };
}

export function trucksRead() {
  return {
    query: resolveRequestDocument(queryTrucks).query,
    variables: {},
  };
}

export function disposalSitesRead() {
  return {
    query: resolveRequestDocument(queryDisposalSites).query,
    variables: {},
  };
}

export function debrisTypesRead() {
  return {
    query: resolveRequestDocument(queryDebrisTypes).query,
    variables: {},
  };
}

export function collectionTasksRead() {
  return {
    query: resolveRequestDocument(queryCollectionTasks).query,
    variables: {},
  };
}

export async function collectionTasksWrite(
  _db,
  rows: RxReplicationWriteToMasterRow<CollectionTaskDocType>[],
) {
  console.log("collection writing replication");
  const extractedData = rows.map(({ newDocumentState }) => newDocumentState);
  const images = extractedData
    .map(({ images, id }) => images.map((image) => ({ ...image, task_id: id })))
    .flat();

  await extractFilesAndSaveToNhost(images);

  const variableImages = images.map((image) =>
    R.omit(image, ["base64Preview"]),
  );
  const variableTasks = extractedData.map((task) => R.omit(task, ["images"]));
  const taskIds = extractedData.map(({ id }) => ({ id }));

  return {
    query: resolveRequestDocument(upsertCollectionTasks).query,
    variables: { tasks: variableTasks, images: variableImages, taskIds },
  };
}
