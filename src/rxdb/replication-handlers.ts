import { resolveRequestDocument } from 'graphql-request'
import { RxReplicationWriteToMasterRow } from 'rxdb'
import { base64toFile, saveFilesToNhost } from '../utils'
import { allTasksDocument, createTasksDocument } from './graphql-operations'
import { TaskDocType } from './rxdb-schemas'

export function tasksRead(_checkpoint, _limit) {
  return {
    query: resolveRequestDocument(allTasksDocument).query,
    variables: {}
  }
}

export async function tasksWrite(
  db,
  rows: RxReplicationWriteToMasterRow<TaskDocType>[]
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

  const extractedImages = extractedData
    .map(({ tasks_images }) => tasks_images)
    .flat()
  const extractedTasks = extractedData.map(
    ({ tasks_images, _deleted, updated_at, created_at, ...rest }) => rest
  )

  return {
    query: resolveRequestDocument(createTasksDocument).query,
    variables: { tasks: extractedTasks, tasks_images: extractedImages }
  }
}
