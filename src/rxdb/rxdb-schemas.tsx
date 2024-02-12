import { RxJsonSchema } from "rxdb";
import {
  ProjectsQuery,
  StumpRemovalTasksQuery,
  TreeRemovalTasksQuery,
  UserQuery,
} from "src/__generated__/gql/graphql";

type OmitTypename<T> = Omit<T, "__typename">;
type ExcludeTypename<T> = Exclude<keyof T, "__typename">;
type SatisfiesSchemaKeys<T> = {
  [K in ExcludeTypename<T>]: RxJsonSchema<unknown>["properties"];
};

export type UserDocType = OmitTypename<UserQuery["usersMetadata"][0]>;

export const userSchema: RxJsonSchema<UserDocType> = {
  title: "user schema",
  description: "user schema",
  version: 0,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    first_name: {
      type: "string",
    },
    last_name: {
      type: "string",
    },
    hire_date: {
      type: "string",
    },
    role_data_manager: {
      type: "boolean",
    },
    role_field_supervisor: {
      type: "boolean",
    },
    role_filed_monitor: {
      type: "boolean",
    },
    role_operations_manager: {
      type: "boolean",
    },
    role_pc_admin: {
      type: "boolean",
    },
    role_project_manager: {
      type: "boolean",
    },
    usersMetadata_user: {
      type: "object",
      properties: {
        email: {
          type: "string",
        },
      },
    },
  },
} as const;

export type ProjectDocType = OmitTypename<ProjectsQuery["projects"][0]>;
export type TicketingName = OmitTypename<ProjectDocType["ticketing_names"][0]>;
export type TicketingNameKeys = SatisfiesSchemaKeys<TicketingName>;

export const projectSchema: RxJsonSchema<ProjectDocType> = {
  title: "project schema",
  version: 0,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    location: {
      type: "string",
    },
    poc: {
      type: "string",
    },
    contractor: {
      type: "string",
    },
    sub_contractor: {
      type: "string",
    },
    status: {
      type: "string",
    },
    comment: {
      type: "string",
    },
    ticketing_names: {
      type: "array",
      properties: {
        id: {
          type: "string",
        },
        name: {
          type: "string",
        },
        add_photos: {
          type: ["boolean", "null"],
        },
        print_ticket: {
          type: ["boolean", "null"],
        },
      } satisfies TicketingNameKeys,
    },
  },
  required: ["id"],
} as const;

export type Steps = "before" | "during" | "after";
export type Images = TreeRemovalTaskDocType["images"][0] &
  Pick<TreeRemovalTaskDocType, "ranges"> & {
    base64Preview: string;
    _deleted?: boolean;
  };

export type TreeRemovalTaskDocType = OmitTypename<
  TreeRemovalTasksQuery["tasks_tree_removal"][0]
>;

type ImagesKeys = SatisfiesSchemaKeys<
  TreeRemovalTaskDocType["images"][0] &
    Pick<TreeRemovalTaskDocType, "ranges"> & { base64Preview: string }
>;

export const treeRemovalTaskSchema: RxJsonSchema<TreeRemovalTaskDocType> = {
  title: "tree removal task schema",
  version: 0,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    comment: {
      type: "string",
    },
    ranges: {
      type: ["string", "null"],
    },
    created_at: {
      type: "string",
    },
    updated_at: {
      type: "string",
    },
    completed: {
      type: "boolean",
    },
    images: {
      type: "array",
      properties: {
        id: {
          type: "string",
        },
        created_at: {
          type: "string",
        },
        latitude: {
          type: "string",
        },
        longitude: {
          type: "string",
        },
        ranges: {
          type: "string",
        },
        taken_at_step: {
          type: "string",
        },
        base64Preview: {
          type: "string",
        },
      } satisfies ImagesKeys,
    },
  },
  required: ["id"],
} as const;

export type StumpRemovalTaskDocType = OmitTypename<
  StumpRemovalTasksQuery["tasks_stump_removal"][0]
>;

export const stumpRemovalTaskSchema: RxJsonSchema<StumpRemovalTaskDocType> = {
  title: "stump removal task schema",
  version: 0,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    comment: {
      type: "string",
    },
    created_at: {
      type: "string",
    },
    updated_at: {
      type: "string",
    },
    completed: {
      type: "boolean",
    },
    images: {
      type: "array",
      properties: {
        id: {
          type: "string",
        },
        created_at: {
          type: "string",
        },
        latitude: {
          type: "string",
        },
        longitude: {
          type: "string",
        },
        ranges: {
          type: "string",
        },
        taken_at_step: {
          type: "string",
        },
        base64Preview: {
          type: "string",
        },
      } satisfies ImagesKeys,
    },
  },
  required: ["id"],
} as const;
