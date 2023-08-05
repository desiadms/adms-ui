import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { Link } from '@tanstack/router'
import { useAtom } from 'jotai'
import { atomState } from '../utils'

export function TasksCompleted() {
  const [state, setState] = useAtom(atomState)

  const inProgressTreeRemoval = state.treeRemoval.filter(
    (task) => task.steps.length === 3
  )

  return (
    <div className='flex flex-col gap-4'>
      {inProgressTreeRemoval.map((task) => {
        return (
          <div key={task.id} className='bg-stone-300 rounded-lg p-4'>
            <h2 className='text-xl uppercase pb-4'>{task.name}</h2>
            <div className='flex gap-4'>
              {task.steps.map(({ stage }) => {
                return (
                  <a
                    key={stage}
                    className='p-4 w-20 h-20 underline capitalize font-light bg-green-400 flex items-center justify-center rounded-lg'
                  >
                    {stage}
                  </a>
                )
              })}
              {[...Array(3 - task.steps.length)].map((_, idx) => {
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

            {/* <div className='flex gap-4'>
              {task.steps.map((step) => {
                return (
                  <div className='w-full' key={step.id}>
                    {step.files.map((file) => {
                      return (
                        <img
                          className='w-1/6 bg-black aspect-square object-contain'
                          src={file.base64}
                          alt=''
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div> */}
          </div>
        )
      })}
    </div>
  )
}
