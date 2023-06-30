import LokiNativescriptAdapter from 'lokijs/src/incremental-indexeddb-adapter'
import { createRxDatabase, lastOfArray } from 'rxdb'
import { replicateGraphQL } from 'rxdb/plugins/replication-graphql'
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { hasuraURL } from './helpers'
import { taskSchema } from './rxdb-schemas'
import { devMode } from './utils'

const pullQueryBuilder = (checkpoint, limit) => ({
  query: `query allTasks {
    tasks {
      id
      name
      updated_at
      tasks_images {
        id
        task_id
      }
    }
  }`,
  variables: {}
})

const pushQueryBuilder = (rows) => {
  const query = `
  mutation task(
    $name: String
    $id: uuid
    $tasks_images: [images_insert_input!]!
  ) {
    insert_tasks_one(object: { name: $name, id: $id }) {
      id
      name
      user_id
    }
    insert_images(objects: $tasks_images) {
      returning {
        id
        task_id
      }
    }
  }
`
  const variables = {
    ...rows
  }
  return {
    query,
    variables
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

// if (devMode) {
//   // in dev-mode we show full error-messages
//   await import('rxdb/plugins/dev-mode').then(
//     // eslint-disable-next-line
//     (module) => addRxPlugin(module as any)
//   )
// }

export async function initialize(accessToken: string) {
  const loki = getRxStorageLoki({
    env: 'BROWSER',
    adapter: new LokiNativescriptAdapter()
  })

  const storage = devMode ? wrappedValidateAjvStorage({ storage: loki }) : loki

  const db = await createRxDatabase({
    name: 'adms',
    storage,
    multiInstance: true,
    eventReduce: true,
    cleanupPolicy: {},
    ignoreDuplicate: true
  })

  console.log('creating collections')
  await db.addCollections({
    tasks: {
      schema: taskSchema
    }
  })

  const replicationState = replicateGraphQL({
    collection: db.tasks,

    // urls to the GraphQL endpoints
    url: {
      http: hasuraURL
    },
    pull: {
      queryBuilder: pullQueryBuilder, // the queryBuilder from above

      responseModifier: (response, source, requestCheckpoint) => {
        console.log('checkpoint', source, requestCheckpoint)

        return {
          checkpoint: getCheckpoint(response, requestCheckpoint),
          documents: response
        }
      }
    },
    push: {
      queryBuilder: pushQueryBuilder, // the queryBuilder from above
      responseModifier: () => []
    },
    // headers which will be used in http requests against the server.
    headers: {
      Authorization: `Bearer ${accessToken}`
    },

    deletedField: 'deleted',
    live: true,
    retryTime: 1000 * 5,
    waitForLeadership: true,
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
