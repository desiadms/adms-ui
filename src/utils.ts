import { UserQuery } from './gql/graphql'

export const devMode = import.meta.env.MODE === 'development'

export function emailToId(email: string | undefined) {
  return email && email.split('@')[0]
}

export function fullName(
  firstName: string | undefined,
  lastName: string | undefined
) {
  return `${firstName} ${lastName}`
}

export function userRoles(user: UserQuery['usersMetadata'][0] | undefined) {
  return (
    user &&
    Object.entries(user)
      .filter(([k, v]) => k.startsWith('role_') && v)
      .map(([k]) => {
        const splitted = k.split('role_')[1]
        return splitted && splitted.replace('_', ' ')
      })
      .join(', ')
  )
}

export function throwCustomError({
  status
}: {
  status: number
  message: string
}) {
  const error = new Error('Custom error')
  ;(error as Error & { status: number }).status = status
  throw error
}

export function arraysAreEqual(
  array1: readonly unknown[] | undefined,
  array2: readonly unknown[] | undefined
): boolean {
  if (!array1 || !array2) return false

  if (array1.length !== array2.length) {
    return false
  }

  return array1.every((element, index) => element === array2[index])
}
