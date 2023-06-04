import { type TypedDocumentNode } from '@graphql-typed-document-node/core'
import {
  NhostClient,
  useAccessToken,
  useAuthenticationStatus,
  useUserId
} from '@nhost/react'
import {
  UseQueryOptions,
  useQuery,
  type UseQueryResult
} from '@tanstack/react-query'
import { OperationDefinitionNode } from 'graphql'
import request from 'graphql-request'
import { useEffect, useState } from 'preact/hooks'

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION
})

const hasuraURL = import.meta.env.VITE_HASURA_ENDPOINT

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
  const { document, variables, ...opts } = props
  // type cast here is ok because it wouldn't make sense to pass a non-operation
  // document
  const operationName = (document.definitions[0] as OperationDefinitionNode)
    .name?.value
  const accessToken = useAccessToken()
  if (!operationName) {
    throw new Error(`Could not find operation name for document: ${document}`)
  }
  const queryKey = [operationName, variables] as const
  return useQuery({
    queryKey,
    queryFn: async (ctx) =>
      request(hasuraURL, document, ctx.queryKey[1], {
        Authorization: `Bearer ${accessToken}`
      }),
    enabled: !!accessToken,
    ...opts
  })
}

export function useAuth() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const userId = useUserId()
  const { isAuthenticated, isLoading } = useAuthenticationStatus()

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

  const offlineButHasLoggedIn = !isOnline && userId

  return offlineButHasLoggedIn
    ? { isAuthenticated: true, isLoading: false }
    : { isAuthenticated, isLoading }
}
