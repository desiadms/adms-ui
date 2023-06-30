export const taskSchema = {
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
}
