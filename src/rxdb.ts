import { addRxPlugin, createRxDatabase, RxDatabase } from "rxdb";
import { RxDBLocalDocumentsPlugin } from "rxdb/plugins/local-documents";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration-schema";
import { RxGraphQLReplicationState } from "rxdb/plugins/replication-graphql";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { devMode } from "./hooks";
import { addCollections } from "./rxdb/abstraction";
import {
  allTaskIdsRead,
  collectionTasksRead,
  collectionTasksWrite,
  contractorsRead,
  debrisTypesRead,
  disposalSitesRead,
  disposalTasksRead,
  disposalTasksWrite,
  projectRead,
  stumpRemovalTasksRead,
  stumpRemovalTasksWrite,
  ticketingTasksRead,
  ticketingTasksWrite,
  treeRemovalTasksRead,
  treeRemovalTasksWrite,
  trucksRead,
  userRead,
  userWrite,
} from "./rxdb/replication-handlers";
import {
  allTaskIdsSchema,
  collectionTaskSchema,
  contractorSchema,
  debrisTypeSchema,
  disposalSiteSchema,
  disposalTaskSchema,
  projectSchema,
  stumpRemovalTaskSchema,
  ticketingTaskSchema,
  treeRemovalTaskSchema,
  truckSchema,
  userSchema,
} from "./rxdb/rxdb-schemas";

addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBLocalDocumentsPlugin);

if (devMode) {
  await import("rxdb/plugins/dev-mode").then(({ RxDBDevModePlugin }) =>
    addRxPlugin(RxDBDevModePlugin),
  );
}

export let db: RxDatabase | undefined;

export async function removeDB() {
  if (db) {
    await db.remove();
    db = undefined;
  }
}

export async function initialize(accessToken: string | null) {
  if (db) return db;

  console.log("in initialize rxdb");
  const dexie = getRxStorageDexie();

  const storage = devMode
    ? wrappedValidateAjvStorage({ storage: dexie })
    : dexie;

  db = await createRxDatabase({
    name: "adms",
    storage,
    eventReduce: true,
    cleanupPolicy: {},
  });

  console.log("creating collections");

  const collections = await addCollections(db, [
    {
      name: "task-ids",
      schema: allTaskIdsSchema,
      pullQueryBuilder: allTaskIdsRead,
      accessToken,
    },

    {
      name: "tree-removal-task",
      schema: treeRemovalTaskSchema,
      pullQueryBuilder: treeRemovalTasksRead,
      pushQueryBuilder: treeRemovalTasksWrite,
      accessToken,
    },
    {
      name: "stump-removal-task",
      schema: stumpRemovalTaskSchema,
      pullQueryBuilder: stumpRemovalTasksRead,
      pushQueryBuilder: stumpRemovalTasksWrite,
      accessToken,
    },
    {
      name: "ticketing-task",
      schema: ticketingTaskSchema,
      pullQueryBuilder: ticketingTasksRead,
      pushQueryBuilder: ticketingTasksWrite,
      accessToken,
    },
    {
      name: "user",
      schema: userSchema,
      pullQueryBuilder: userRead,
      pushQueryBuilder: userWrite,
      accessToken,
    },
    {
      name: "project",
      schema: projectSchema,
      pullQueryBuilder: projectRead,
      accessToken,
    },
    {
      name: "contractor",
      schema: contractorSchema,
      pullQueryBuilder: contractorsRead,
      accessToken,
    },
    {
      name: "truck",
      schema: truckSchema,
      pullQueryBuilder: trucksRead,
      accessToken,
    },
    {
      name: "disposal-site",
      schema: disposalSiteSchema,
      pullQueryBuilder: disposalSitesRead,
      accessToken,
    },
    {
      name: "debris-type",
      schema: debrisTypeSchema,
      pullQueryBuilder: debrisTypesRead,
      accessToken,
    },
    {
      name: "collection-task",
      schema: collectionTaskSchema,
      pullQueryBuilder: collectionTasksRead,
      pushQueryBuilder: collectionTasksWrite,
      accessToken,
    },
    {
      name: "disposal-task",
      schema: disposalTaskSchema,
      pullQueryBuilder: disposalTasksRead,
      pushQueryBuilder: disposalTasksWrite,
      accessToken,
    },
  ]);

  const taskIdsCollection = collections.filter(
    (collection) => collection.name === "task-ids",
  );

  const replicationState =
    taskIdsCollection?.length && taskIdsCollection?.[0]?.replicationState;

  if (replicationState) {
    pollTaskIds(replicationState);
  }

  return db;
}

function pollTaskIds(
  replicationState: RxGraphQLReplicationState<unknown, null>,
) {
  const checkAndResyncReplicationState = () => {
    replicationState.reSync();
    // Reschedule the function to run
    setTimeout(checkAndResyncReplicationState, 5000);
  };

  checkAndResyncReplicationState();
}
