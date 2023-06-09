import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'preact/hooks'
import { useForm } from 'react-hook-form'
import { AllTasksQuery } from 'src/gql/graphql'
import { v4 } from 'uuid'
import { graphql } from '../gql'
import { hasuraMutation, nhost, useHasuraQuery } from '../helpers'

export const allTasksDocument = graphql(/* GraphQL */ `
  query allTasks {
    tasks {
      id
      name
      tasks_images {
        id
        taskId
      }
    }
  }
`)

const createTaskDocument = graphql(/* GraphQL */ `
  mutation task(
    $name: String
    $taskId: uuid
    $images: [images_insert_input!]!
  ) {
    insert_tasks_one(object: { name: $name, id: $taskId }) {
      id
      name
      user
    }
    insert_images(objects: $images) {
      returning {
        id
        taskId
      }
    }
  }
`)

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

function Task({ data }: { data: AllTasksQuery }) {
  const [imageUrls, setImageUrls] = useState<Record<string, string[]>>()

  useEffect(() => {
    const fetchData = async () => {
      const urls = await Promise.all(
        data.tasks.map(async (task) => {
          const urls = await Promise.all(
            task.tasks_images.map(async (image) => {
              const { presignedUrl } = await nhost.storage.getPresignedUrl({
                fileId: image.id
              })
              return presignedUrl?.url
            })
          )
          return { taskId: task.id, urls }
        })
      )
      const urlsByTaskId = urls.reduce((acc, { taskId, urls }) => {
        acc[taskId] = urls
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

export function ReportView() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm()

  const { data } = useHasuraQuery({
    queryKey: ['allTasks'],
    document: allTasksDocument
  })

  const submitTask = taskMutation()

  function submitForm(data) {
    clearErrors()

    // to check that at least one file was uploaded
    const hasFiles = data.files.some((file) => file[0])

    if (!hasFiles) {
      setError('files', { message: 'Please take at least one picture' })
      return
    }

    const taskId = v4()

    const fileMetadata = data.files
      .filter((file) => file[0])
      .map((file) => ({
        id: v4(),
        taskId,
        file: file[0]
      }))
    const images = fileMetadata.map(({ id, taskId }) => ({ id, taskId }))
    const files = fileMetadata.map(({ id, file }) => ({ id, file }))

    submitTask.mutate({
      hasura: { name: data.task, taskId, images },
      files
    })
  }

  const queryClient = useQueryClient()
  const mutationCache = queryClient.getMutationCache().getAll()

  return (
    <div>
      <form
        onSubmit={handleSubmit(submitForm)}
        className='flex flex-col gap-2 items-start'
      >
        {[0, 1, 2].map((index) => (
          <div key={index} className='p-2 bg-slate-300 w-fit'>
            <label htmlFor={`file-${index}`}>
              Take Picture {index + 1}
              <input
                id={`file-${index}`}
                type='file'
                accept='image/*'
                capture='camera'
                className='hidden'
                {...register(`files[${index}]`)}
              />
            </label>
          </div>
        ))}

        {errors.files && <p className='text-red-500'>{errors.files.message}</p>}

        <div className='p-2 w-fit rounded-lg'>
          <label htmlFor='task' className='flex flex-col gap-2'>
            Task Name
            <input
              id='task'
              type='text'
              {...register('task', { required: true })}
            />
          </label>
        </div>
        {errors.task && <p className='text-red-500'>Task name is required</p>}
        <button className='p-2 mt-4 bg-green-300 ' type='submit'>
          Submit
        </button>
      </form>

      {data && <Task data={data} />}

      {mutationCache?.map(({ state }) => {
        const { context, ...rest } = state
        return <pre>{JSON.stringify(rest, null, 2)}</pre>
      })}
    </div>
  )
}
