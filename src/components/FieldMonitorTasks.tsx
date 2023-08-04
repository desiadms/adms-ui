import { TaskType } from './common'

export function FieldMonitorTasks() {
  return (
    <div className='flex flex-col gap-2'>
      <TaskType
        name='hazardous tree removal'
        href='/tasks/field-monitor/tree-removal'
      />
      <TaskType
        name='branch/stump tree removal'
        href='/tasks/field-monitor/branch-removal'
      />
    </div>
  )
}
