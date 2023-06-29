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

type Result = Record<string, unknown> | undefined

type StoreObjectInDatabaseType = {
  db: IDBDatabase
  dbObjectStoreName: string
  objectStoreKey: string
  data: Result
}

export function storeObjectInDatabase({
  db,
  dbObjectStoreName,
  objectStoreKey,
  data
}: StoreObjectInDatabaseType) {
  const transaction = db.transaction([dbObjectStoreName], 'readwrite')
  const objectStore = transaction.objectStore(dbObjectStoreName)

  const addObjectRequest = objectStore.put(data, objectStoreKey)

  addObjectRequest.onsuccess = (_errorevent) => {
    console.log('Object updated in IndexedDB')
  }

  transaction.oncomplete = (_event) => {
    console.log('Transaction completed')
  }

  transaction.onerror = (event) => {
    console.error('Transaction error:', (event.target as IDBRequest).error)
  }
}

type QueryCallback = ({
  result,
  error,
  message
}: {
  result: Result
  error?: boolean
  message?: DOMException | null
}) => void

type QueryObjectFromDatabaseType = {
  db: IDBDatabase
  dbObjectStoreName: string
  objectStoreKey: string
  callback: QueryCallback
}

export function queryObjectFromDatabase({
  db,
  dbObjectStoreName,
  objectStoreKey,
  callback
}: QueryObjectFromDatabaseType): void {
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

type OpenDatabaseType = {
  db: IDBDatabase
  store: (data: Result) => void
  query: (callback: QueryCallback) => void
}

export function openDatabase(
  db: 'adms' | 'react-query',
  callback: ({ db, store, query }: OpenDatabaseType) => void
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
        storeObjectInDatabase({ db, dbObjectStoreName, objectStoreKey, data }),
      query: (callback) =>
        queryObjectFromDatabase({
          db,
          dbObjectStoreName,
          objectStoreKey,
          callback
        })
    })
  }

  request.onerror = (event) => {
    console.error('Database error:', (event.target as IDBOpenDBRequest).error)
  }
}
