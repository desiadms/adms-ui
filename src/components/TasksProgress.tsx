import { CheckIcon, PlusIcon } from '@heroicons/react/20/solid'
import { Link } from '@tanstack/router'
import classNames from 'classnames'
import { useCallback } from 'preact/hooks'
import { useRxData } from 'rxdb-hooks'
import { Images, Steps, TreeRemovalTaskDocType } from '../rxdb/rxdb-schemas'
import { nhost } from '../utils'

export async function tasksWithImages(
  tasks: TreeRemovalTaskDocType[] | undefined
) {
  const tasksWithImageUrls = Promise.all(
    tasks?.map(async (task) => {
      const imagesWithUrls = await Promise.all(
        task?.images?.map(async (image) => {
          const { presignedUrl } = await nhost.storage.getPresignedUrl({
            fileId: image.id
          })
          return { ...image, base64Preview: presignedUrl?.url }
        })
      )
      return { ...task, images: await imagesWithUrls }
    }) || []
  )
  return tasksWithImageUrls
}

function useInProgressTasks() {
  const query = useCallback((collection) => collection.find(), [])

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

export function TasksProgress() {
  const { results } = useInProgressTasks()
  return (
    <div className='flex flex-col gap-4'>
      <div>Tree Removal Tasks</div>
      {results?.['tree-removal-tasks'].map((task) => {
        const { missingSteps, steps } = generateSteps(task.id, task.images)
        return (
          <div key={task.id} className='bg-stone-300 rounded-lg p-4'>
            <div className='flex gap-10'>
              {Object.entries(steps).map(([taken_at_step]) => (
                <TaskCheck taken_at_step={taken_at_step as Steps} icon='done' />
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
