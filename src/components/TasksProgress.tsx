import { PlusCircleIcon } from '@heroicons/react/20/solid'
import { Link } from '@tanstack/router'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { useRxData } from 'rxdb-hooks'
import { TreeRemovalTaskDocType } from 'src/rxdb/rxdb-schemas'
import { nhost } from '../utils'

async function tasksWithImages(tasks: TreeRemovalTaskDocType[] | undefined) {
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

type TasksInProgress = {
  'tree-removal-tasks': TreeRemovalTaskDocType[]
}

function useInProgressTasks() {
  const query = useCallback((collection) => collection.find(), [])

  const { result, isFetching } = useRxData<TreeRemovalTaskDocType>(
    'tree-removal-task',
    query
  )

  const [tasks, setTasks] = useState<TasksInProgress>()

  useEffect(() => {
    const enrichTasks = async () => {
      const tasksWithImageUrls = await tasksWithImages(result)
      setTasks({ 'tree-removal-tasks': tasksWithImageUrls })
    }
    enrichTasks()
  }, [result])

  return {
    results: tasks,
    isFetching
  }
}

export function TasksProgress() {
  const { results, isFetching } = useInProgressTasks()

  return (
    <div className='flex flex-col gap-4'>
      <div>Tree Removal Tasks</div>
      {results?.['tree-removal-tasks'].map((task) => {
        return (
          <div key={task.id} className='bg-stone-300 rounded-lg p-4'>
            <div className='flex gap-4'>
              {task.images.map(({ taken_at_step, base64Preview }) => {
                console.log(base64Preview)
                return (
                  <div className='flex flex-col gap-2 items-center'>
                    <p className='text-xs'>
                      {taken_at_step} <br /> measurement
                    </p>
                    <img
                      src={base64Preview}
                      className='p-4 w-20 h-20 underline capitalize font-light bg-green-400 flex items-center justify-center rounded-lg'
                    ></img>
                  </div>
                )
              })}
              {[...Array(3 - task.images.length)].map((_, idx) => {
                return (
                  <Link
                    key={idx}
                    to={`/tasks/field-monitor/tree-removal/${task.id}`}
                    className='p-4 w-20 h-20 underline capitalize font-light bg-amber-400 flex items-center justify-center rounded-lg'
                  >
                    <PlusCircleIcon />
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
