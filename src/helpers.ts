import { type TypedDocumentNode } from '@graphql-typed-document-node/core'
import { NhostClient, useAuthenticationStatus } from '@nhost/react'
import {
  MutationCache,
  MutationKey,
  QueryClient,
  QueryKey,
  UseQueryOptions,
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

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION
})

const hasuraURL = import.meta.env.VITE_HASURA_ENDPOINT

async function getAccessToken() {
  // casting to unknown because the  type JWTClaims is missing the exp field
  const decodedAccessToken = nhost.auth.getDecodedAccessToken() as unknown
  const exp = (decodedAccessToken as { exp: number })?.exp
  const expirationDate = exp && new Date(exp * 1000)

  if (!expirationDate || expirationDate < new Date()) {
    console.log('token expired')
    await nhost.auth.refreshSession()
  }

  const token = nhost.auth.getAccessToken()

  return token
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
      })
    },
    ...opts
  })
}

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
    onError: (error, variables, _context, mutation) => {
      console.error(error)
      // handle here failed mutations. Maybe store to local storage and retry later via user interaction
      console.log('mutation error', mutation, variables)

      toast.error(JSON.stringify(error))
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

function defaultOnMutate(queryKey: QueryKey) {
  return async (variables) => {
    await queryClient.cancelQueries({ queryKey })
    const previousData = queryClient.getQueryData(queryKey) as Promise<unknown>
    const currentKey = Object.keys(previousData)[0] as string
    const prevColl = previousData[currentKey]
    prevColl.push(variables)

    queryClient.setQueryData(queryKey, {
      [currentKey]: prevColl
    })

    return previousData
  }
}

function defaultOnError(queryKey: QueryKey) {
  return (error, _payload, previousData) => {
    console.log('in error')
    console.log(error)
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
    queryKey: ['tasks'],
    mutationKey: ['createTask'],
    document,
    callback
  })

  return () =>
    useMutation<
      Promise<TResult>,
      Promise<Error>,
      { hasura: Strict<TVariables> } & Record<string, unknown>
    >({
      mutationKey,
      onMutate: defaultOnMutate(queryKey),
      onError: defaultOnError(queryKey),
      onSettled: defaultOnSettled(queryKey)
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

export function useCamera(): [
  string[],
  (event: React.ChangeEvent<HTMLInputElement>) => void,
  (index: number) => void
] {
  const [capturedImages, setCapturedImages] = useState<string[]>([])

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const imageSrc = reader.result as string
        setCapturedImages((images) => [...images, imageSrc])
      }
      reader.readAsDataURL(file)
    }
  }

  const deleteImage = (index: number) => {
    setCapturedImages((images) => images.filter((_, i) => i !== index))
  }

  return [capturedImages, handleCapture, deleteImage]
}
