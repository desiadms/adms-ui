import { RxJsonSchema } from 'rxdb'

export type TaskDocType = {
  id: string
  name: string
  tasks_images?: { id: string; task_id: string }[]
  updated_at: string
  created_at: string
}

export const taskSchema: RxJsonSchema<TaskDocType> = {
  title: 'task schema',
  description: 'task schema',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    name: {
      type: 'string'
    },
    created_at: {
      type: 'string'
    },
    updated_at: {
      type: 'string'
    },
    tasks_images: {
      type: 'array',
      properties: {
        id: {
          type: 'string'
        },
        task_id: {
          type: 'string'
        }
      }
    }
  },
  required: ['id', 'name']
} as const
