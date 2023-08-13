import { RxJsonSchema } from 'rxdb'

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

export type ProjectDocType = {
  id: string
  name: string
  location: string
  updated_at: string
  created_at: string
  poc: string
  contractor: string
  sub_contractor: string
  status: boolean
  comment: string
}

export const projectSchema: RxJsonSchema<ProjectDocType> = {
  title: 'project schema',
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
    location: {
      type: 'string'
    },
    poc: {
      type: 'string'
    },
    contractor: {
      type: 'string'
    },
    sub_contractor: {
      type: 'string'
    },
    status: {
      type: 'string'
    },
    comment: {
      type: 'string'
    }
  },
  required: ['id']
} as const

export type Images = {
  id: string
  base64Preview?: string
  created_at: string
  latitude: string
  longitude: string
  ranges?: string
  taken_at_step: 'before' | 'during' | 'after'
}

export type TreeRemovalTaskDocType = {
  id: string
  updated_at: string
  created_at: string
  comment?: string
  completed?: boolean
  images: Images[]
}

export const treeRemovalTaskSchema: RxJsonSchema<TreeRemovalTaskDocType> = {
  title: 'tree removal task schema',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    comment: {
      type: 'string'
    },
    created_at: {
      type: 'string'
    },
    updated_at: {
      type: 'string'
    },
    completed: {
      type: 'boolean'
    },
    images: {
      type: 'array',
      properties: {
        id: {
          type: 'string'
        },
        created_at: {
          type: 'string'
        },
        latitude: {
          type: 'string'
        },
        longitude: {
          type: 'string'
        },
        ranges: {
          type: 'string'
        },
        taken_at_step: {
          type: 'string'
        },
        base64Preview: {
          type: 'string'
        }
      }
    }
  },
  required: ['id']
} as const
