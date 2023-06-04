import { MutationCache, QueryClient } from '@tanstack/react-query'
import {
  PersistedClient,
  Persister
} from '@tanstack/react-query-persist-client'
import request from 'graphql-request'
import { del, get, set } from 'idb-keyval'
import toast from 'react-hot-toast'
import { graphql } from './gql'
import { TaskMutation } from './gql/graphql'
import { nhost } from './helpers'

const cacheTime = 1000 * 60 * 60 * 24 * 7 // 7 days

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime,
      staleTime: 2000,
      retry: false
    }
  },
  mutationCache: new MutationCache({
    onSuccess: (data) => {
      console.log('mutation success', data)
      toast.success(JSON.stringify(data))
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
    maxAge: cacheTime,
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

const createTaskDocument = graphql(/* GraphQL */ `
  mutation task($name: String!) {
    insert_tasks_one(object: { name: $name }) {
      name
    }
  }
`)

const hasuraURL = import.meta.env.VITE_HASURA_ENDPOINT

// we need a default mutation function so that paused mutations can resume after a page reload
queryClient.setMutationDefaults(['mutation'], {
  mutationFn: async ({ name }: { name: string }): Promise<TaskMutation> => {
    // to avoid clashes with our optimistic update when an offline mutation continues
    await queryClient.cancelQueries({ queryKey: ['allTasks'] })

    return request(
      hasuraURL,
      createTaskDocument,
      { name },
      {
        Authorization: `Bearer ${nhost.auth.getAccessToken()}`
      }
    )
  }
})
