import { UserQuery } from './gql/graphql'

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
