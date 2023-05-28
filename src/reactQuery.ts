import { MutationCache, QueryClient } from '@tanstack/react-query'
import {
  PersistedClient,
  Persister
} from '@tanstack/react-query-persist-client'
import axios from 'axios'
import { del, get, set } from 'idb-keyval'
import toast from 'react-hot-toast'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 2000,
      retry: false
    }
  },
  mutationCache: new MutationCache({
    onSuccess: (data) => {
      console.log('mutationCache.onSuccess', data)
      toast.success(data)
    },
    onError: (error) => {
      if (error instanceof Error) toast.error(error.message)
    }
  })
})

/**
 * Creates an Indexed DB persister
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'tbSpecialist') {
  return {
    persistClient: async (client: PersistedClient) => {
      set(idbValidKey, client)
    },
    restoreClient: async () => {
      const client = await get<PersistedClient>(idbValidKey)
      return client
    },
    removeClient: async () => {
      await del(idbValidKey)
    }
  } as Persister
}

export const persister = createIDBPersister()

// we need a default mutation function so that paused mutations can resume after a page reload
queryClient.setMutationDefaults(['mutation'], {
  mutationFn: async ({ text }: { text: string }): Promise<string> => {
    // to avoid clashes with our optimistic update when an offline mutation continues
    await queryClient.cancelQueries({ queryKey: ['data'] })
    return axios.post('/api/data', { text }).then((res) => res.data)
  }
})

export function fetchData(): Promise<string[]> {
  return axios.get('/api/data').then((res) => res.data)
}
