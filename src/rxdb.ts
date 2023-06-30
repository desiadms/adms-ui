import LokiNativescriptAdapter from 'lokijs/src/incremental-indexeddb-adapter'
import { createRxDatabase, lastOfArray } from 'rxdb'
import { replicateGraphQL } from 'rxdb/plugins/replication-graphql'
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs'
import { hasuraURL } from './helpers'

export const taskSchema = {
  title: 'task schema',
  description: 'task schema',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    tasks_images: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        task_id: {
          type: 'string'
        }
      }
    }
  },
  required: ['id', 'name']
}

export const db = await createRxDatabase({
  name: 'adms',
  storage: getRxStorageLoki({
    env: 'BROWSER',
    adapter: new LokiNativescriptAdapter()
  }),
  multiInstance: true,
  eventReduce: true,
  cleanupPolicy: {},
  ignoreDuplicate: true
})

const tasksColl = await db.addCollections({
  tasks: {
    schema: taskSchema
  }
})

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

function getCheckpoint(data: any[], lastCheckpoint) {
  const lastDoc = lastOfArray(data)
  return {
    id: lastDoc?.id ?? lastCheckpoint?.id ?? '',
    updatedAt:
      lastDoc?.updated_at ??
      lastCheckpoint?.updated_at ??
      new Date(0).toISOString()
  }
}

export const replicationState = replicateGraphQL({
  collection: db.tasks,

  // urls to the GraphQL endpoints
  url: {
    http: hasuraURL
  },
  pull: {
    queryBuilder: pullQueryBuilder, // the queryBuilder from above

    responseModifier: (response, source, requestCheckpoint) => {
      console.log('checkpoint', source, requestCheckpoint)
      console.log('checkpoint', getCheckpoint(response, requestCheckpoint))

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
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLUFjdGl2ZS1Qcm9qZWN0IjoiMThiYWZiYjMtMGI1Yy00Y2YxLThjNTctZWFjZjUyYTMyNTM4IiwieC1oYXN1cmEtZm9vIjoiOTU0MGFhN2UtMWViMC00ZGIxLWFhZWQtNGUwNzZlZTBlOTQ0IiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJtZSIsInVzZXIiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoidXNlciIsIngtaGFzdXJhLXVzZXItaWQiOiI5NTQwYWE3ZS0xZWIwLTRkYjEtYWFlZC00ZTA3NmVlMGU5NDQiLCJ4LWhhc3VyYS11c2VyLWlzLWFub255bW91cyI6ImZhbHNlIn0sInN1YiI6Ijk1NDBhYTdlLTFlYjAtNGRiMS1hYWVkLTRlMDc2ZWUwZTk0NCIsImlhdCI6MTY4ODA3OTI5NiwiZXhwIjoxNjg4MDg1Mjk2LCJpc3MiOiJoYXN1cmEtYXV0aCJ9.k7WCdyA-pw2JkZD4r-dutIqVzPakS0b_81EffyMlyk4`
  },

  deletedField: 'deleted',
  live: true,
  retryTime: 1000 * 5,
  waitForLeadership: true,
  autoStart: true
})

replicationState.awaitInitialReplication().then(() => {
  console.log('Initial replication done')
})

db.tasks
  ?.find()
  .exec()
  .then((docs) => {
    console.log('all docs', docs)
  })
