import { type TypedDocumentNode } from '@graphql-typed-document-node/core'
import { NhostClient, useAuthenticationStatus } from '@nhost/react'
import {
  MutationCache,
  MutationKey,
  QueryClient,
  QueryKey,
  UseQueryOptions,
  dehydrate,
  useMutation,
  useQuery,
  type UseQueryResult
} from '@tanstack/react-query'
import {
  PersistedClient,
  Persister
} from '@tanstack/react-query-persist-client'
import { OperationDefinitionNode } from 'graphql'
import request from 'graphql-request'
import { del, get, set } from 'idb-keyval'
import { useEffect, useState } from 'preact/hooks'
import toast from 'react-hot-toast'
import { openDatabase } from './indexedDb'
import { arraysAreEqual, throwCustomError } from './utils'

interface Error {
  status?: number
  code?: number
}

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION
})

export const hasuraURL = import.meta.env.VITE_HASURA_ENDPOINT

async function getAccessToken() {
  const decodedAccessToken = nhost.auth.getDecodedAccessToken()
  const exp = decodedAccessToken?.exp
  const expirationDate = exp && new Date(exp * 1000)

  if (!expirationDate || expirationDate < new Date()) {
    const res = await nhost.auth.refreshSession()

    if (!res.session) {
      throwCustomError({ status: 401, message: 'Refresh Token Expired' })
    } else {
      return res.session.accessToken
    }
  }

  return nhost.auth.getAccessToken()
}

// inspired by GraphQL Code Generator’s recommendations:
// https://the-guild.dev/graphql/codegen/docs/guides/react-vue#appendix-i-react-query-with-a-custom-fetcher-setup
/** Helper type to force empty object to undefined. */
type Strict<T> = T extends Record<string, never> ? undefined : NonNullable<T>
/**
 * Hook for hasura GraphQL Queries using `@tanstack/react-query`.
 *
 * @param document - The GraphQL query document, specified as per this example
 *  https://the-guild.dev/graphql/codegen/docs/guides/react-vue
 * @param variables - The variables for the document if required
 * @returns Tanstack query result.
 */
export function useHasuraQuery<TResult, TVariables, TData = TResult>(
  props: {
    document: TypedDocumentNode<TResult, TVariables>
    queryKey?: QueryKey
    variables?: Strict<TVariables>
  } & Pick<
    UseQueryOptions<TResult, Error, TData>,
    | 'meta'
    | 'retry'
    | 'context'
    | 'suspense'
    | 'behavior'
    | 'enabled'
    | 'onSuccess'
    | 'onError'
    | 'onSettled'
    | 'select'
    | 'staleTime'
    | 'cacheTime'
    | 'initialData'
    | 'initialDataUpdatedAt'
    | 'networkMode'
    | 'placeholderData'
    | 'keepPreviousData'
    | 'isDataEqual'
    | 'structuralSharing'
    | 'notifyOnChangeProps'
  >
): UseQueryResult<TData, Error> {
  const { document, variables, queryKey, ...opts } = props
  // type cast here is ok because it wouldn't make sense to pass a non-operation
  // document
  const operationName = (document.definitions[0] as OperationDefinitionNode)
    .name?.value
  if (!operationName) {
    throw new Error(`Could not find operation name for document: ${document}`)
  }
  const queryKeyVar = variables
    ? [operationName, variables]
    : ([operationName] as const)
  return useQuery({
    queryKey: queryKey ?? queryKeyVar,
    queryFn: async () => {
      const accessToken = await getAccessToken()
      if (!accessToken) throw new Error('No access token in useHasuraQuery')

      return request(hasuraURL, document, variables ?? {}, {
        Authorization: `Bearer ${accessToken}`
      }).then((data) => data)
    },
    ...opts
  })
}

const cacheTime = Infinity

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime,
      staleTime: 2000,
      retry: false
    }
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const { mutationKey } = mutation.options

      // we can safely remove the mutation from adms indexedDB because it was successful
      openDatabase('adms', ({ query, store }) => {
        query(({ result }) => {
          if (result) {
            const mutations = result.mutations || []

            const mutationIndex = mutations.findIndex((m) =>
              arraysAreEqual(m.mutationKey, mutationKey)
            )

            if (mutationIndex > -1) {
              mutations.splice(mutationIndex, 1)
            } else {
              throw new Error(
                "Couldn't find mutation in indexedDB. It implies that the mutation was not persisted onMutate, or that the find function is not working correctly."
              )
            }

            store({ mutations })
          }
        })
      })

      toast.success(mutationKey)
    },
    onError: async (_error, _variables, _context, mutation) => {
      toast.error(JSON.stringify(mutation.options.mutationKey))
    }
  })
})

// const callback = (event) => {
//   console.log('mutation cache update')
// }

// queryClient.getMutationCache().subscribe(callback)

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

const retryOptions = {
  retryDelay: 2000,
  retry: (failureCount, error) => {
    const status = error?.status
    return Boolean(
      status && (status === 401 || status >= 500) && failureCount < 3
    )
  }
}

function setMutationDefaults<TResult, TVariables>({
  mutationKey,
  queryKey,
  document,
  callback
}: {
  mutationKey: MutationKey
  queryKey: QueryKey
  document: TypedDocumentNode<TResult, TVariables>
  callback?: (
    variables: { hasura: Strict<TVariables> } & Record<string, unknown>
  ) => Promise<unknown>
}) {
  queryClient.setMutationDefaults(mutationKey, {
    ...retryOptions,
    mutationFn: async (
      variables: { hasura: Strict<TVariables> } & Record<string, unknown>
    ): Promise<TResult> => {
      // to avoid clashes with our optimistic update when an offline mutation continues
      await queryClient.cancelQueries({ queryKey })

      const token = await getAccessToken()

      await callback?.(variables)
      return request(hasuraURL, document, variables.hasura, {
        Authorization: `Bearer ${token}`
      })
    }
  })
}

function defaultOnMutate(queryKey: QueryKey, mutationKey: MutationKey) {
  return async (variables) => {
    const { mutations } = dehydrate(queryClient, {
      shouldDehydrateMutation: (mutation) =>
        mutation.options.mutationKey === mutationKey,
      shouldDehydrateQuery: () => false
    })

    const mutation = mutations && mutations[0]

    if (mutation) {
      openDatabase('adms', ({ query, store }) => {
        query(({ result }) => {
          if (result) {
            const mutations = result.mutations || []
            mutations.push(mutation)

            store({ mutations })
          } else {
            store({ mutations: [mutation] })
          }
        })
      })
    }

    await queryClient.cancelQueries({ queryKey })
    const previousData = queryClient.getQueryData(queryKey) as Promise<unknown>
    const currentKey = Object.keys(previousData)[0] as string
    const prevColl = previousData[currentKey]
    prevColl.push(variables.hasura)

    queryClient.setQueryData(queryKey, {
      [currentKey]: prevColl
    })

    return previousData
  }
}

function defaultOnError(queryKey: QueryKey) {
  return (_error, _payload, previousData) => {
    console.log('in error', _payload)
    queryClient.setQueryData(queryKey, previousData)
  }
}

function defaultOnSettled(queryKey: QueryKey) {
  return () => {
    console.log('in settled')
    queryClient.invalidateQueries({ queryKey })
  }
}

export function hasuraMutation<TResult, TVariables>({
  mutationKey,
  queryKey,
  document,
  callback
}: {
  mutationKey: MutationKey
  queryKey: QueryKey
  document: TypedDocumentNode<TResult, TVariables>
  callback?: (
    variables: { hasura: Strict<TVariables> } & Record<string, unknown>
  ) => Promise<unknown>
}) {
  setMutationDefaults({
    queryKey,
    mutationKey,
    document,
    callback
  })

  return () =>
    useMutation<
      Promise<TResult>,
      Error,
      { hasura: Strict<TVariables> } & Record<string, unknown>
    >({
      mutationKey,
      onMutate: defaultOnMutate(queryKey, mutationKey),
      onError: defaultOnError(queryKey),
      onSettled: defaultOnSettled(queryKey),
      ...retryOptions
    })
}

export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  useEffect(() => {
    const handleOfflineStatus = () => {
      setIsOnline(false)
    }

    const handleOnlineStatus = () => {
      setIsOnline(true)
    }

    window.addEventListener('offline', handleOfflineStatus)
    window.addEventListener('online', handleOnlineStatus)

    return () => {
      window.removeEventListener('offline', handleOfflineStatus)
      window.removeEventListener('online', handleOnlineStatus)
    }
  }, [])
  return isOnline
}

export function useAuth() {
  const isOnline = useIsOnline()
  const { isAuthenticated, isLoading } = useAuthenticationStatus()

  return !isOnline
    ? { isAuthenticated: true, isLoading: false }
    : { isAuthenticated, isLoading }
}

export function useGeoLocation() {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  function getGeoLocation() {
    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = position.coords
        setCoordinates(pos)
        setIsLoading(false)
      },
      (error) => {
        setError(error.message)
        setIsLoading(false)
      }
    )
  }

  useEffect(() => {
    getGeoLocation()
  }, [])

  return { coordinates, isLoading, error, getGeoLocation }
}
