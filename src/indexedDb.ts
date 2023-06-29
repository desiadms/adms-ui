import { DehydratedState } from '@tanstack/react-query'

export type Mutation = DehydratedState['mutations'][0]

const DBs = {
  adms: {
    dbName: 'adms',
    dbObjectStoreName: 'keyval',
    objectStoreKey: 'tbSpecialist'
  },
  'react-query': {
    dbName: 'keyval-store',
    dbObjectStoreName: 'keyval',
    objectStoreKey: 'tbSpecialist'
  }
}

type DocumentTypes = {
  adms: {
    mutations: Mutation[]
  }
  'react-query': {
    clientState: DehydratedState
  }
}

type Result<T extends keyof DocumentTypes> = DocumentTypes[T] | undefined

type StoreObjectInDatabaseType<T extends keyof DocumentTypes> = {
  db: IDBDatabase
  dbObjectStoreName: string
  objectStoreKey: string
  data: Result<T>
}

export function storeObjectInDatabase<T extends keyof DocumentTypes>({
  db,
  dbObjectStoreName,
  objectStoreKey,
  data
}: StoreObjectInDatabaseType<T>) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([dbObjectStoreName], 'readwrite')
    const objectStore = transaction.objectStore(dbObjectStoreName)

    const addObjectRequest = objectStore.put(data, objectStoreKey)

    addObjectRequest.onsuccess = (_errorevent) => {
      console.log('Object updated in IndexedDB')
    }

    transaction.oncomplete = (_event) => {
      console.log('Transaction completed')
      resolve('Transaction completed')
    }

    transaction.onerror = (event) => {
      console.error('Transaction error:', (event.target as IDBRequest).error)
      reject(new Error('Transaction error'))
    }
  })
}

type QueryCallback<T extends keyof DocumentTypes> = {
  result: Result<T>
  error?: boolean
  message?: DOMException | null
}

type QueryObjectFromDatabaseType<T extends keyof DocumentTypes> = {
  db: IDBDatabase
  dbObjectStoreName: string
  objectStoreKey: string
  callback: (callback: QueryCallback<T>) => void
}

export function queryObjectFromDatabase<T extends keyof DocumentTypes>({
  db,
  dbObjectStoreName,
  objectStoreKey,
  callback
}: QueryObjectFromDatabaseType<T>): void {
  const transaction: IDBTransaction = db.transaction(
    [dbObjectStoreName],
    'readonly'
  )
  const objectStore: IDBObjectStore = transaction.objectStore(dbObjectStoreName)

  const queryObjectRequest = objectStore.get(objectStoreKey)

  queryObjectRequest.onsuccess = (event: Event): void => {
    const { result } = event.target as IDBRequest
    callback({ result })
  }

  queryObjectRequest.onerror = (event: Event): void => {
    const { error } = event.target as IDBRequest
    console.error('Object query error:', error)
    callback({ result: undefined, error: true, message: error })
  }
}

type OpenDatabaseType<T extends keyof DocumentTypes> = {
  db: IDBDatabase
  store: (data: Result<T>) => void
  query: (callback: (callback: QueryCallback<T>) => void) => void
}

export function openDatabase<T extends keyof DocumentTypes>(
  db: T,
  callback: ({ db, store, query }: OpenDatabaseType<T>) => void
) {
  const { dbName, dbObjectStoreName, objectStoreKey } = DBs[db]
  const request = indexedDB.open(dbName, 1)

  request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
    const db = (event.target as IDBOpenDBRequest).result as IDBDatabase
    db.createObjectStore(dbObjectStoreName)
  }

  request.onsuccess = (event) => {
    const db = (event.target as IDBOpenDBRequest).result as IDBDatabase
    callback({
      db,
      store: (data) =>
        storeObjectInDatabase<T>({
          db,
          dbObjectStoreName,
          objectStoreKey,
          data
        }),
      query: (queryCallback) =>
        queryObjectFromDatabase<T>({
          db,
          dbObjectStoreName,
          objectStoreKey,
          callback: queryCallback
        })
    })
  }

  request.onerror = (event) => {
    console.error('Database error:', (event.target as IDBOpenDBRequest).error)
  }
}
