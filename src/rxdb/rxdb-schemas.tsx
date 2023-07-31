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

export type UserDocType = {
  id: string
  first_name: string
  last_name: string
  role_data_manager: boolean
  role_field_supervisor: boolean
  role_filed_monitor: boolean
  role_operations_manager: boolean
  role_pc_admin: boolean
  role_project_manager: boolean
  hire_date: string
  usersMetadata_user: {
    email: string
  }
}

export const userSchema: RxJsonSchema<UserDocType> = {
  title: 'user schema',
  description: 'user schema',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    first_name: {
      type: 'string'
    },
    last_name: {
      type: 'string'
    },
    hire_date: {
      type: 'string'
    },
    role_data_manager: {
      type: 'boolean'
    },
    role_field_supervisor: {
      type: 'boolean'
    },
    role_filed_monitor: {
      type: 'boolean'
    },
    role_operations_manager: {
      type: 'boolean'
    },
    role_pc_admin: {
      type: 'boolean'
    },
    role_project_manager: {
      type: 'boolean'
    },
    usersMetadata_user: {
      type: 'object',
      properties: {
        email: {
          type: 'string'
        }
      }
    }
  }
} as const
