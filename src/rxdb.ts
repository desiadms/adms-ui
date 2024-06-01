import { addRxPlugin, createRxDatabase } from "rxdb";
import { RxDBLocalDocumentsPlugin } from "rxdb/plugins/local-documents";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration-schema";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { addCollections } from "./rxdb/abstraction";
import {
  contractorsRead,
  debrisTypesRead,
  disposalSitesRead,
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
  contractorSchema,
  debrisTypeSchema,
  disposalSiteSchema,
  projectSchema,
  stumpRemovalTaskSchema,
  ticketingTaskSchema,
  treeRemovalTaskSchema,
  truckSchema,
  userSchema,
} from "./rxdb/rxdb-schemas";
import { devMode } from "./hooks";

addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBLocalDocumentsPlugin);

if (devMode) {
  await import("rxdb/plugins/dev-mode").then(({ RxDBDevModePlugin }) =>
    addRxPlugin(RxDBDevModePlugin),
  );
}

export async function initialize(accessToken: string | null) {
  const dexie = getRxStorageDexie();

  const storage = devMode
    ? wrappedValidateAjvStorage({ storage: dexie })
    : dexie;

  const db = await createRxDatabase({
    name: "adms",
    storage,
    eventReduce: true,
    cleanupPolicy: {},
  });

  console.log("creating collections");

  await addCollections(db, [
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
  ]);

  return db;
}
