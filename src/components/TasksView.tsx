import { TaskType } from './common'

export function TasksView() {
  return (
    <div className='flex flex-col gap-2'>
      <TaskType name='field monitor' href='/tasks/field-monitor' />
      <TaskType name='field collections' href='/tasks/field-collections' />
      <TaskType name='field disposal' href='/tasks/field-disposal' />
    </div>
  )
}
