import { UserQuery } from './gql/graphql'
import { nhost } from './helpers'

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

export async function blobToBase64(
  blob: Blob,
  removePrefix?: 'removePrefix'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onerror = () => reject(fileReader.error)
    fileReader.onloadend = () => {
      const dataUrl = fileReader.result as string
      // remove "data:mime/type;base64," prefix from data url
      const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1)
      resolve(removePrefix ? base64 : dataUrl)
    }
    fileReader.readAsDataURL(blob)
  })
}

export function base64toFile(
  base64String: string,
  fileName: string,
  mimeType: string
): File {
  const byteCharacters = atob(base64String)
  const byteArrays: Uint8Array[] = []

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024)
    const byteNumbers = new Array(slice.length)

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: mimeType })
  return new File([blob], fileName, { type: mimeType })
}

export function keep<T, U>(
  coll: T[],
  mapperFn: (item: T) => U | null | undefined
): NonNullable<U>[] {
  return coll.reduce((acc: NonNullable<U>[], item: T) => {
    const transformed = mapperFn(item)
    if (transformed !== null && transformed !== undefined) {
      acc.push(transformed as NonNullable<U>)
    }
    return acc
  }, [])
}

export function saveFilesToNhost(files: { id: string; file: File }[]) {
  return Promise.all(
    files.map(({ id, file }) => nhost.storage.upload({ file, id }))
  )
}
