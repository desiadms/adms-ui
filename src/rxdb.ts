import { addRxPlugin, createRxDatabase, lastOfArray } from 'rxdb'
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents'
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { addCollections } from './rxdb/abstraction'
import {
  projectRead,
  tasksRead,
  tasksWrite,
  userRead,
  userWrite
} from './rxdb/replication-handlers'
import {
  projectSchema,
  treeRemovalTaskSchema,
  userSchema
} from './rxdb/rxdb-schemas'
import { devMode } from './utils'

addRxPlugin(RxDBMigrationPlugin)
addRxPlugin(RxDBLocalDocumentsPlugin)

function getCheckpoint<T extends { id: string; updated_at: string }>(
  data: T[],
  lastCheckpoint
) {
  const lastDoc = lastOfArray(data)
  return {
    id: lastDoc?.id ?? lastCheckpoint?.id ?? '',
    updatedAt:
      lastDoc?.updated_at ??
      lastCheckpoint?.updated_at ??
      new Date(0).toISOString()
  }
}

if (devMode) {
  await import('rxdb/plugins/dev-mode').then(({ RxDBDevModePlugin }) =>
    addRxPlugin(RxDBDevModePlugin)
  )
}

export async function initialize(accessToken: string | null) {
  const dexie = getRxStorageDexie()

  const storage = devMode
    ? wrappedValidateAjvStorage({ storage: dexie })
    : dexie

  const db = await createRxDatabase({
    name: 'adms',
    storage,
    eventReduce: true,
    cleanupPolicy: {}
  })

  console.log('creating collections')

  await addCollections(db, [
    {
      name: 'tree-removal-task',
      schema: treeRemovalTaskSchema,
      localDocuments: true,
      pullQueryBuilder: tasksRead,
      pushQueryBuilder: tasksWrite,
      accessToken
    },
    {
      name: 'user',
      schema: userSchema,
      pullQueryBuilder: userRead,
      pushQueryBuilder: userWrite,
      accessToken
    },
    {
      name: 'project',
      schema: projectSchema,
      pullQueryBuilder: projectRead,
      accessToken
    }
  ])

  return db
}
