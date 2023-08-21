import { CheckIcon, PlusIcon } from '@heroicons/react/20/solid'
import { ClockIcon } from '@heroicons/react/24/outline'
import { Link } from '@tanstack/router'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { useRxData } from 'rxdb-hooks'
import { Images, Steps, TreeRemovalTaskDocType } from '../rxdb/rxdb-schemas'
import { humanizeDate, nhost } from '../utils'
import { Button } from './Forms'
import { Modal, ModalContentProps, ModalTriggerProps } from './Modal'

async function fetchImages(images: Images[] | undefined) {
  return Promise.all(
    images?.map(async (image) => {
      // when not synched with the server, the image will already have
      // a base64Preview string
      if (image.base64Preview) {
        return image
      }
      const { presignedUrl } = await nhost.storage.getPresignedUrl({
        fileId: image.id
      })
      // using the same base64Preview field to store the presignedUrl
      return { ...image, base64Preview: presignedUrl?.url }
    }) || []
  )
}

export async function tasksWithImages(
  tasks: TreeRemovalTaskDocType[] | undefined
) {
  const tasksWithImageUrls = Promise.all(
    tasks?.map(async (task) => {
      const imagesWithUrls = await fetchImages(task.images)
      return { ...task, images: imagesWithUrls }
    }) || []
  )
  return tasksWithImageUrls
}

function useInProgressTasks() {
  const query = useCallback(
    (collection) =>
      collection.find({
        sort: [{ created_at: 'desc' }]
      }),
    []
  )

  const { result, isFetching } = useRxData<TreeRemovalTaskDocType>(
    'tree-removal-task',
    query
  )

  return {
    results: { 'tree-removal-tasks': result },
    isFetching
  }
}

function generateSteps(taskId: string, images: Images[]) {
  const steps: Steps[] = ['before', 'during', 'after']
  const takenAtSteps = images.map((image) => image.taken_at_step)
  const missingSteps = steps.filter((step) => !takenAtSteps.includes(step))
  // add href link only to first step
  const missingStepsFinal = missingSteps.map((step, index) => {
    if (index === 0) {
      return {
        step,
        href: `/tasks/field-monitor/tree-removal/${taskId}?step=${step}`
      }
    }
    return {
      step,
      disabled: true
    }
  })

  const groupedSteps = images.reduce((acc, image) => {
    const { taken_at_step } = image
    if (!acc[taken_at_step]) {
      acc[taken_at_step] = []
    }
    acc[taken_at_step].push(image)
    return acc
  }, {} as Record<Steps, Images[]>)

  return { missingSteps: missingStepsFinal, steps: groupedSteps }
}

function TaskCheck({
  taken_at_step,
  icon
}: {
  taken_at_step: Steps
  icon: 'done' | 'add' | 'disabled'
}) {
  const iconComponent = () => {
    switch (icon) {
      case 'done':
        return <CheckIcon className='text-white' />
      case 'add':
        return <PlusIcon className='text-white' />
      case 'disabled':
        return <div />
      default:
        return <div />
    }
  }

  return (
    <div className='flex flex-col gap-2 items-center justify-center'>
      <p
        className={classNames('text-xs text-center capitalize', {
          'text-gray-500': icon === 'disabled'
        })}
      >
        {taken_at_step} <br /> measurement
      </p>
      <div
        className={classNames('rounded-xl border-2 w-20 h-20', {
          'bg-amber-500': icon === 'add',
          'bg-green-500': icon === 'done',
          'bg-gray-400': icon === 'disabled'
        })}
      >
        {iconComponent()}
      </div>
    </div>
  )
}

function TaskPreview({
  modalProps,
  images,
  task,
  taken_at_step
}: {
  modalProps: ModalContentProps
  images: Images[]
  task: TreeRemovalTaskDocType
  taken_at_step: Steps
}) {
  const [fetchedImages, setFetchedImages] = useState<Images[]>([])

  useEffect(() => {
    fetchImages(images).then(setFetchedImages)
  }, [])

  return (
    <div className='relative flex flex-col gap-4'>
      <div className='flex gap-1'>
        <div className='font-medium'>Date:</div>
        {humanizeDate(task.updated_at)}
      </div>

      {taken_at_step === 'during' && task.ranges && (
        <div className='flex gap-1'>
          <div className='font-medium'>Ranges:</div>
          {task.ranges}
        </div>
      )}

      {fetchedImages.map((image) => (
        <div className='' key={image.id}>
          <img
            className='w-full h-full object-cover'
            src={image.base64Preview}
            alt=''
          />
        </div>
      ))}
      <div className='flex justify-between'>
        <div className='w-fit'>
          <Button onClick={modalProps.closeModal}>Back</Button>
        </div>
        <div className='w-fit'>
          <Button onClick={modalProps.closeModal}>Retake</Button>
        </div>
      </div>
    </div>
  )
}

export function TasksProgress() {
  const { results } = useInProgressTasks()
  const modalTrigger = useCallback(
    ({ openModal }: ModalTriggerProps, taken_at_step: Steps) => (
      <div onClick={openModal}>
        <TaskCheck taken_at_step={taken_at_step} icon='done' />
      </div>
    ),
    []
  )

  const modalBody = useCallback(
    (
      modalProps: ModalContentProps,
      images: Images[],
      task: TreeRemovalTaskDocType,
      taken_at_step: Steps
    ) => (
      <TaskPreview
        modalProps={modalProps}
        images={images}
        task={task}
        taken_at_step={taken_at_step}
      />
    ),
    []
  )

  return (
    <div className='flex flex-col gap-4'>
      <div>Tree Removal Tasks</div>
      {results?.['tree-removal-tasks'].map((task) => {
        const { missingSteps, steps } = generateSteps(task.id, task.images)
        return (
          <div key={task.id} className='bg-stone-300 rounded-lg p-4'>
            <div className='flex justify-end items-center gap-1 pb-4'>
              <div className='text-xs'>
                <ClockIcon className='w-4 h-4' />
              </div>
              <div className='text-xs'>{humanizeDate(task.updated_at)}</div>
            </div>
            <div className='flex gap-10'>
              {Object.entries(steps).map(([taken_at_step, images]) => (
                <Modal
                  title={`${taken_at_step} measurement`}
                  key={taken_at_step}
                  modalTrigger={(props) =>
                    modalTrigger(props, taken_at_step as Steps)
                  }
                  modalContent={(props) =>
                    modalBody(props, images, task, taken_at_step as Steps)
                  }
                />
              ))}
              {missingSteps.map(({ disabled, step, href }) => (
                <div>
                  {disabled ? (
                    <TaskCheck taken_at_step={step} icon='disabled' />
                  ) : (
                    <Link key={href} to={href}>
                      <TaskCheck taken_at_step={step} icon='add' />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
