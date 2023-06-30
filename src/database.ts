export const db = await createRxDatabase({
  name: 'adms',
  storage: getRxStorageDexie(),
  multiInstance: true,
  eventReduce: true,
  cleanupPolicy: {}
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
    writeRows: rows
  }
  return {
    query,
    variables
  }
}

const replicationState = replicateGraphQL({
  collection: db.tasks,

  // urls to the GraphQL endpoints
  url: {
    http: hasuraURL
  },
  pull: {
    queryBuilder: pullQueryBuilder, // the queryBuilder from above
    modifier: (doc) => {
      console.log('in here', doc)
      return doc
    }, // (optional) modifies all pulled documents before they are handled by RxDB
    /**
     * Amount of documents that the remote will send in one request.
     * If the response contains less then [batchSize] documents,
     * RxDB will assume there are no more changes on the backend
     * that are not replicated.
     * This value is the same as the limit in the pullHuman() schema.
     * [default=100]
     */
    batchSize: 100
  },
  push: {
    queryBuilder: pushQueryBuilder, // the queryBuilder from above
    /**
     * batchSize (optional)
     * Amount of document that will be pushed to the server in a single request.
     */
    batchSize: 5,
    /**
     * modifier (optional)
     * Modifies all pushed documents before they are send to the GraphQL endpoint.
     * Returning null will skip the document.
     */
    modifier: (doc) => doc
  },
  // headers which will be used in http requests against the server.
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLUFjdGl2ZS1Qcm9qZWN0IjoiMThiYWZiYjMtMGI1Yy00Y2YxLThjNTctZWFjZjUyYTMyNTM4IiwieC1oYXN1cmEtZm9vIjoiOTU0MGFhN2UtMWViMC00ZGIxLWFhZWQtNGUwNzZlZTBlOTQ0IiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJtZSIsInVzZXIiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoidXNlciIsIngtaGFzdXJhLXVzZXItaWQiOiI5NTQwYWE3ZS0xZWIwLTRkYjEtYWFlZC00ZTA3NmVlMGU5NDQiLCJ4LWhhc3VyYS11c2VyLWlzLWFub255bW91cyI6ImZhbHNlIn0sInN1YiI6Ijk1NDBhYTdlLTFlYjAtNGRiMS1hYWVkLTRlMDc2ZWUwZTk0NCIsImlhdCI6MTY4ODA3NDUzMSwiZXhwIjoxNjg4MDc1MTMxLCJpc3MiOiJoYXN1cmEtYXV0aCJ9.CGtrsnaeJy4dpakkK-BBIrKUMzBNEP8OsOMa9Q_Mevk`
  },

  /**
   * Options that have been inherited from the RxReplication
   */
  deletedField: 'deleted',
  live: true,
  retryTime: 1000 * 5,
  waitForLeadership: true,
  autoStart: true
})
