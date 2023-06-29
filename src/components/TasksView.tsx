import { CameraIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { useEffect, useState } from 'preact/hooks'
import { useFieldArray, useForm } from 'react-hook-form'
import { v4 } from 'uuid'
import { AllTasksQuery } from '../gql/graphql'
import { allTasksDocument, createTaskDocument } from '../graphql-operations'
import { hasuraMutation, nhost, useHasuraQuery } from '../helpers'
import {
  Button,
  ErrorMessage,
  Input,
  LabelledInput,
  buttonClasses,
  useFilesForm
} from './Forms'

function saveMedia(variables) {
  const { files } = variables
  return Promise.all(
    files.map(({ id, file }) => nhost.storage.upload({ file, id }))
  )
}

const taskMutation = hasuraMutation({
  queryKey: ['allTasks'],
  mutationKey: ['createTask'],
  document: createTaskDocument,
  callback: saveMedia
})

function Tasks({ data }: { data: AllTasksQuery }) {
  const [imageUrls, setImageUrls] = useState<Record<string, string[]>>()

  useEffect(() => {
    const fetchData = async () => {
      const flattenedImages = data?.tasks?.flatMap((task) =>
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
      {data.tasks.map((task) => (
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
}

function genFileMetadata(filesData: FileForm[]) {
  const taskId = v4()

  const fileMetadata = filesData
    .filter((file) => file?.fileInstance && file.fileInstance[0])
    .map(({ fileInstance }) => ({
      id: v4(),
      task_id: taskId,
      file: fileInstance && fileInstance[0]
    }))
  const images = fileMetadata.map(({ id, task_id }) => ({ id, task_id }))
  const files = fileMetadata.map(({ id, file }) => ({ id, file }))

  return { images, files, taskId }
}

export function TasksView() {
  const { data } = useHasuraQuery({
    queryKey: ['allTasks'],
    document: allTasksDocument
  })

  console.log(data)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    control,
    formState: { errors }
  } = useForm<TaskFormData>({
    defaultValues: {
      task: '',
      files: [{ fileInstance: undefined }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'files'
  })

  const {
    useFilePreviews: [filePreviews],
    onChangeSetFilePreview,
    validateFileSize,
    removePreview
  } = useFilesForm()

  const submitTask = taskMutation()

  function submitForm(data: TaskFormData) {
    // clearErrors()
    // // to check that at least one file was uploaded
    // const hasFiles = data.files.some(
    //   (file) => file.fileInstance && file.fileInstance[0]
    // )

    // if (!hasFiles) {
    //   setError('files', { message: 'Please take at least one picture' })
    //   return
    // }

    const { taskId, images, files } = genFileMetadata(data.files)

    submitTask.mutate({
      hasura: { name: data.task, id: taskId, tasks_images: images },
      files
    })
  }

  const maxSize = 3

  function handleAppend() {
    if (fields.length < maxSize) {
      append({ fileInstance: undefined })
    }
  }

  function handleRemove(index: number, id: string) {
    removePreview(id)
    remove(index)
  }

  const queryClient = useQueryClient()
  const mutationCache = queryClient.getMutationCache().getAll()

  return (
    <div>
      <form
        onSubmit={handleSubmit(submitForm)}
        className='flex flex-col gap-2 items-start'
      >
        {fields.map(({ id }, index) => (
          <div key={id}>
            <label
              className={classNames(buttonClasses, {
                hidden: filePreviews && filePreviews[id]
              })}
            >
              <CameraIcon className='w-6 h-6 text-white' />
              Take Picture
              <Input
                type='file'
                accept='image/*'
                capture='camera'
                hidden
                {...register(`files.${index}.fileInstance`, {
                  validate: {
                    lessThan5MB: (file) =>
                      validateFileSize(file, 5 * 1024 * 1024)
                  },
                  onChange: (e) => {
                    onChangeSetFilePreview(e, id)
                  }
                })}
              />
            </label>
            {filePreviews && filePreviews[id] && (
              <div>
                <div className='relative w-1/2'>
                  <img
                    className='w-full object-cover'
                    src={filePreviews[id]}
                    alt=''
                  />
                  <button
                    className='absolute -top-4 -right-4 rounded-full bg-gray-800'
                    type='button'
                    onClick={() => handleRemove(index, id)}
                  >
                    <XCircleIcon className='w-10 h-10 text-red-400' />
                  </button>
                </div>
              </div>
            )}
            {errors.files && errors.files[index] && (
              <ErrorMessage
                message={errors.files[index]?.fileInstance?.message}
              />
            )}
          </div>
        ))}
        {fields.length < maxSize && (
          <div>
            <Button type='button' onClick={handleAppend}>
              + Add Picture
            </Button>
          </div>
        )}

        {errors.files && <p className='text-red-500'>{errors.files.message}</p>}

        <div className='p-2 w-fit rounded-lg'>
          <LabelledInput
            label='Task Name'
            type='text'
            {...register('task', { required: 'Task name is required' })}
          />
          <ErrorMessage message={errors.task?.message} />
        </div>

        <div>
          <Button type='submit' disabled={submitTask.isLoading}>
            Submit
          </Button>
        </div>
      </form>

      {data && <Tasks data={data} />}

      {mutationCache?.map(({ state }) => {
        const { context, ...rest } = state
        return <pre>{JSON.stringify(rest, null, 2)}</pre>
      })}
    </div>
  )
}
