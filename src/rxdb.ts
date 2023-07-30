import { resolveRequestDocument } from 'graphql-request'
import {
  RxReplicationWriteToMasterRow,
  addRxPlugin,
  createRxDatabase,
  lastOfArray
} from 'rxdb'
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents'
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration'
import { replicateGraphQL } from 'rxdb/plugins/replication-graphql'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { allTasksDocument, createTasksDocument } from './graphql-operations'
import { hasuraURL } from './helpers'
import { TaskDocType, taskSchema } from './rxdb-schemas'
import { base64toFile, devMode, saveFilesToNhost } from './utils'

addRxPlugin(RxDBMigrationPlugin)
addRxPlugin(RxDBLocalDocumentsPlugin)

const pullQueryBuilder = (_checkpoint, _limit) => ({
  query: resolveRequestDocument(allTasksDocument).query,
  variables: {}
})

const pushQueryBuilder = async (
  db,
  rows: RxReplicationWriteToMasterRow<TaskDocType>[]
) => {
  const extractedData = rows.map(({ newDocumentState }) => newDocumentState)
  const taskIds = extractedData.map(({ id }) => id)

  const taskImages = Promise.all<{ id: string; file: File }[]>(
    taskIds.map(async (taskId) => {
      const rxLocalDoc = await db.collections.tasks.getLocal(taskId)
      const b64Files = rxLocalDoc?.get('files')

      const blobFiles = b64Files.map(({ id, base64 }) => ({
        id,
        file: base64toFile(base64, 'task', 'image/png')
      }))

      return blobFiles
    })
  )

  const flattenedTaskImages = (await taskImages).flat()

  await saveFilesToNhost(flattenedTaskImages)

  const extractedImages = extractedData
    .map(({ tasks_images }) => tasks_images)
    .flat()
  const extractedTasks = extractedData.map(
    ({ tasks_images, _deleted, updated_at, created_at, ...rest }) => rest
  )

  return {
    query: resolveRequestDocument(createTasksDocument).query,
    variables: { tasks: extractedTasks, tasks_images: extractedImages }
  }
}

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

export async function initialize(accessToken: string) {
  const dexie = getRxStorageDexie()

  const storage = devMode
    ? wrappedValidateAjvStorage({ storage: dexie })
    : dexie

  const db = await createRxDatabase({
    name: 'adms',
    storage,
    multiInstance: true,
    eventReduce: true,
    cleanupPolicy: {}
  })

  console.log('creating collections')
  await db.addCollections({
    tasks: {
      schema: taskSchema,
      localDocuments: true
    }
  })

  const replicationState = replicateGraphQL<TaskDocType, null>({
    collection: db.tasks,

    // urls to the GraphQL endpoints
    url: {
      http: hasuraURL
    },
    pull: {
      queryBuilder: pullQueryBuilder,

      responseModifier: (response, _source, _requestCheckpoint) => ({
        checkpoint: null, // getCheckpoint(response, requestCheckpoint),
        documents: response
      })
    },
    push: {
      queryBuilder: (doc) => pushQueryBuilder(db, doc),
      responseModifier: () => [],
      batchSize: 10
    },
    // headers which will be used in http requests against the server.
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    live: true,
    retryTime: 1000 * 5,
    autoStart: true
  })

  replicationState.error$.subscribe((err) => {
    console.error('replication error:')
    console.dir(err)
  })

  replicationState.awaitInitialReplication().then(() => {
    console.log('Initial replication done')
  })

  return db
}
