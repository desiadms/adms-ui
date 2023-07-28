type TaskImage = {
  id: string
  task_id: string
}

export type Task = {
  id: string
  name: string
  updated_at: string
  tasks_images: TaskImage[]
  _deleted: boolean
}
