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
  _db,
  rows: RxReplicationWriteToMasterRow<TreeRemovalTaskDocType>[]
) {
  const extractedData = rows.map(({ newDocumentState }) => newDocumentState)
  const images = extractedData
    .map(({ images, id }) => images.map((image) => ({ ...image, task_id: id })))
    .flat()

  const blobFiles = images.map(({ id, base64Preview }) => ({
    id,
    file: base64toFile(base64Preview, 'task', 'image/png')
  }))

  const flattenedTaskImages = blobFiles.flat()
  await saveFilesToNhost(flattenedTaskImages)

  const variableImages = images.map(({ base64Preview, ...rest }) => rest)
  const variableTasks = extractedData.map(({ images, ...rest }) => rest)

  return {
    query: resolveRequestDocument(upsertTreeRemovalTasks).query,
    variables: { tasks: variableTasks, images: variableImages }
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
