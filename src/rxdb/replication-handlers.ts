import { resolveRequestDocument } from 'graphql-request'
import { RxReplicationWriteToMasterRow } from 'rxdb'
import { base64toFile, saveFilesToNhost } from '../utils'
import {
  projectsDocument,
  queryTreeRemovalTasks,
  updateUserDocument,
  upsertTreeRemovalTasks,
  userDocument
} from './graphql-operations'
import { TreeRemovalTaskDocType, UserDocType } from './rxdb-schemas'

export function tasksRead() {
  return {
    query: resolveRequestDocument(queryTreeRemovalTasks).query,
    variables: {}
  }
}

export async function tasksWrite(
  db,
  rows: RxReplicationWriteToMasterRow<TreeRemovalTaskDocType>[]
) {
  const extractedData = rows.map(({ newDocumentState }) => newDocumentState)
  const taskIds = extractedData.map(({ id }) => id)

  const taskImages = Promise.all<{ id: string; file: File }[]>(
    taskIds.map(async (taskId) => {
      const rxLocalDoc = await db.collections.tasks.getLocal(taskId)
      const b64Files = rxLocalDoc?.get('files')

      const blobFiles = b64Files.map(({ id, base64 }) => ({
        id,
        file: base64toFile(base64, 'task', 'image/png')
      }))

      return blobFiles
    })
  )

  const flattenedTaskImages = (await taskImages).flat()
  await saveFilesToNhost(flattenedTaskImages)

  const extractedImages = extractedData.map(({ images }) => images).flat()
  const extractedTasks = extractedData.map(
    ({ images, _deleted, updated_at, created_at, ...rest }) => rest
  )

  return {
    query: resolveRequestDocument(upsertTreeRemovalTasks).query,
    variables: { tasks: extractedTasks, images: extractedImages }
  }
}

export function userRead() {
  return {
    query: resolveRequestDocument(userDocument).query,
    variables: {}
  }
}

export function userWrite(
  _db,
  rows: RxReplicationWriteToMasterRow<UserDocType>[]
) {
  const extractedData = rows.map(({ newDocumentState }) => newDocumentState)
  const user = extractedData[0]
  console.log('in user write', user)

  return {
    query: resolveRequestDocument(updateUserDocument).query,
    variables: {
      id: user?.id,
      first_name: user?.first_name,
      last_name: user?.last_name
    }
  }
}

export function projectRead() {
  return {
    query: resolveRequestDocument(projectsDocument).query,
    variables: {}
  }
}
