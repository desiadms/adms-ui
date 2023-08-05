import { useEffect, useState } from 'preact/hooks'
import { v4 } from 'uuid'
import { TaskDocType } from '../rxdb/rxdb-schemas'
import { blobToBase64, keep, nhost } from '../utils'
import { TaskType } from './common'

function Tasks({ data }: { data: TaskDocType[] }) {
  const [imageUrls, setImageUrls] = useState<Record<string, string[]>>()

  useEffect(() => {
    const fetchData = async () => {
      const flattenedImages = data?.flatMap((task) =>
        task?.tasks_images?.map((image) => image)
      )

      const urls = await Promise.all(
        flattenedImages.map(async (image) => {
          const { presignedUrl } = await nhost.storage.getPresignedUrl({
            fileId: image.id
          })
          return { task_id: image.task_id, url: presignedUrl?.url }
        })
      )

      const urlsByTaskId = urls.reduce((acc, { task_id, url }) => {
        const urls = acc[task_id] || []
        urls.push(url)
        acc[task_id] = urls
        return acc
      }, {})

      setImageUrls(urlsByTaskId)
    }

    fetchData()
  }, [data])

  return (
    <div>
      {data.map((task) => (
        <div key={task.id}>
          <h2>{task.name}</h2>
          <div className='flex gap-4'>
            {imageUrls &&
              imageUrls[task.id]?.map((url) => (
                <div className='w-1/3' key={url}>
                  <img
                    className='w-full h-full object-cover'
                    src={url}
                    alt=''
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

type FileForm = { fileInstance: File | undefined }
type TaskFormData = {
  task: string
  files: FileForm[]
  comment: string
}

async function genTaskImagesMetadata(filesData: FileForm[]) {
  const taskId = v4()
  const fileMetadata = await Promise.all(
    keep(
      filesData,
      (file) => file?.fileInstance && (file.fileInstance[0] as File)
    ).map(async (file) => ({
      id: v4(),
      task_id: taskId,
      // add back remove prefix
      // await blobToBase64(file, 'removePrefix')
      base64: await blobToBase64(file)
    }))
  )

  const images = fileMetadata.map(({ id, task_id }) => ({ id, task_id }))
  const files = fileMetadata.map(({ id, base64 }) => ({ id, base64 }))

  return { images, files, taskId }
}

export function TasksView() {
  return (
    <div className='flex flex-col gap-2'>
      <TaskType name='field monitor' href='/tasks/field-monitor' />
      <TaskType name='field collections' href='/tasks/field-collections' />
      <TaskType name='field disposal' href='/tasks/field-disposal' />
    </div>
  )
}
