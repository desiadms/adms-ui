import { useForm } from 'react-hook-form'
import { useRxCollection } from 'rxdb-hooks'
import { nhost } from '../helpers'
import { base64toFile, blobToBase64 } from '../utils'
import { Button, Input, useFilesForm } from './Forms'

function saveMedia(files) {
  return Promise.all(
    files.map(({ id, file }) => nhost.storage.upload({ file, id }))
  )
}

type FileForm = { fileInstance: File | undefined }
type TaskFormData = {
  task: string
  files: FileForm[]
}

async function genFileMetadata(filesData: FileForm[]) {
  const taskId = v4()
  const fileMetadata = await Promise.all(
    keep(
      filesData,
      (file) => file?.fileInstance && (file.fileInstance[0] as File)
    ).map(async (file) => ({
      id: v4(),
      task_id: taskId,
      base64: await blobToBase64(file)
    }))
  )

  const images = fileMetadata.map(({ id, task_id }) => ({ id, task_id }))
  const files = fileMetadata.map(({ id, base64 }) => ({ id, base64 }))

  return { images, files, taskId }
}

export function Test() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      file: { fileInstance: undefined }
    }
  })

  const {
    useFilePreviews: [filePreviews],
    onChangeSetFilePreview,
    validateFileSize
  } = useFilesForm()

  const tasksCollection = useRxCollection('tasks')

  async function submitForm(data) {
    const { file } = data
    console.log('original', file)

    // blobToBase64(file[0]).then((base64) => {
    //   const f = base64toFile(base64, 'foo2', 'image/png')
    //   console.log(f)
    // })

    const b64 = await blobToBase64(file[0], 'removePrefix')
    await tasksCollection?.upsertLocal('e', { file: b64 })
    const localDoc = await tasksCollection?.getLocal('e')
    const retrieved = localDoc?.get('file')
    saveMedia([
      { id: 'a', file: base64toFile(retrieved, 'newImage', 'image/png') }
    ])
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit(submitForm)}
        className='flex flex-col gap-2 items-start'
      >
        {filePreviews && (
          <img className='w-full object-cover' src={filePreviews.file} alt='' />
        )}
        <label>
          mammete
          <Input
            type='file'
            accept='image/*'
            capture='camera'
            hidden
            {...register(`file`, {
              validate: {
                lessThan5MB: (file) => validateFileSize(file, 5 * 1024 * 1024)
              },
              onChange: (e) => {
                onChangeSetFilePreview(e, 'file')
              }
            })}
          />
        </label>

        <Button type='submit'>Submit</Button>
      </form>
    </div>
  )
}
