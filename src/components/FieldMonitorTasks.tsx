import { CameraIcon, XCircleIcon } from '@heroicons/react/20/solid'
import { useNavigate, useParams } from '@tanstack/router'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useMemo } from 'preact/hooks'
import { useFieldArray, useForm } from 'react-hook-form'
import { v4 } from 'uuid'
import { atomState, blobToBase64, keep, useGeoLocation } from '../utils'
import {
  Button,
  ErrorMessage,
  Input,
  Label,
  LabelledTextArea,
  useFilesForm
} from './Forms'
import { TaskType } from './common'
import { Spinner } from './icons'

export function FieldMonitorTasks() {
  return (
    <div className='flex flex-col gap-2'>
      <TaskType
        name='hazardous tree removal'
        href={`/tasks/field-monitor/tree-removal/${v4()}`}
      />
      <TaskType
        name='branch/stump tree removal'
        href='/tasks/field-monitor/branch-removal'
      />
    </div>
  )
}

type FileForm = { fileInstance: File | undefined }

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

export function TreeRemovalForm() {
  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm({
    defaultValues: {
      task: '',
      comment: '',
      files: [{ fileInstance: undefined }, { fileInstance: undefined }]
    }
  })

  const [state, setState] = useAtom(atomState)

  const { id } = useParams()

  function stageFn() {
    const currentTask = state.treeRemoval.find((task) => task.id === id)

    if (!currentTask) return 'before'

    return currentTask.steps.length === 1 ? 'during' : 'after'
  }

  const stage = useMemo(() => stageFn(), [state.treeRemoval])
  console.log('stage', stage)
  const { fields, append, update } = useFieldArray({
    control,
    name: 'files'
  })

  const {
    useFilePreviews: [filePreviews],
    onChangeSetFilePreview,
    validateFileSize,
    removePreview
  } = useFilesForm()

  const currentDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        minute: 'numeric',
        hour: 'numeric'
      }).format(new Date()),
    []
  )

  const { coordinates } = useGeoLocation()
  const navigate = useNavigate()

  async function submitForm(data) {
    clearErrors()
    // to check that at least one file was uploaded
    const hasFiles = data.files.some(
      (file) => file.fileInstance && file.fileInstance[0]
    )
    if (!hasFiles) {
      setError('files', { message: 'Please take at least one picture' })
      return
    }
    const { taskId, files } = await genTaskImagesMetadata(data.files)

    const payload = {
      id: v4(),
      coordinates,
      stage,
      datetime: currentDateTime,
      files
    }

    if (stage === 'before') {
      setState((state) => ({
        ...state,
        treeRemoval: [
          ...state.treeRemoval,
          {
            id: taskId,
            name: 'hazardous tree removal',
            steps: [payload]
          }
        ]
      }))
    } else {
      setState((state) => ({
        ...state,
        treeRemoval: state.treeRemoval.map((task) => {
          if (task.id === id) {
            return {
              ...task,
              steps: [
                ...task.steps,
                {
                  ...payload,
                  ...(stage === 'after' && { comment: data.comment })
                }
              ]
            }
          }
          return task
        })
      }))
    }

    navigate({ to: stage === 'after' ? '/completed' : '/progress' })
  }

  const maxSize = 2

  function handleAppend() {
    if (fields.length < maxSize) {
      append({ fileInstance: undefined })
    }
  }

  function handleRemove(index: number, id: string) {
    removePreview(id)
    update(index, { fileInstance: undefined })
  }

  return (
    <div>
      <div className='capitalize font-medium pb-4'>
        Tree Removal - {`${stage} measurement`}
      </div>
      <form
        onSubmit={handleSubmit(submitForm)}
        className='flex flex-col gap-2 items-start bg-zinc-200 rounded-md p-4'
      >
        <div className='p-2 w-fit rounded-lg'>
          <Label label='Date & Time' />

          <div className='text-sm'>{currentDateTime}</div>
        </div>

        <div className='p-2 w-fit rounded-lg'>
          <Label label='Geo Location' />

          <div className='text-sm'>
            <div>
              <div className='flex gap-2 items-center'>
                Latitude:{' '}
                {coordinates?.latitude || <Spinner className='w-3 h-3' />}
              </div>
              <div className='flex gap-2 items-center'>
                Longitude:{' '}
                {coordinates?.longitude || <Spinner className='w-3 h-3' />}
              </div>
            </div>
          </div>
        </div>

        <div className='p-2'>
          <Label label='Photos' />
          <div className='flex flex-col gap-1'>
            {fields.map(({ id }, index) => (
              <div className='flex flex-col gap-1' key={id}>
                <label
                  className={classNames(
                    'flex gap-1 rounded w-fit bg-slate-500 text-white px-2 py-1 text-xs'
                  )}
                >
                  <CameraIcon className='w-4 h-4 text-white' />
                  <span className='text-xs'>Take Picture</span>
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
          </div>
        </div>

        {errors.files && <p className='text-red-500'>{errors.files.message}</p>}
        {stage === 'after' && (
          <div className='p-2 w-full rounded-lg'>
            <LabelledTextArea
              label='Comment'
              {...register('comment', { required: 'Task name is required' })}
            />
            <ErrorMessage message={errors.task?.message} />
          </div>
        )}
        <div className='px-2'>
          <Button type='submit'>Save</Button>
        </div>
      </form>
    </div>
  )
}
