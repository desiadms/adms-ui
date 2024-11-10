import type { RxJsonSchema } from "rxdb";
import type {
	AllTaskIdsQuery,
	CollectionTasksQuery,
	ContractorsQuery,
	DebrisTypesQuery,
	DisposalSitesQuery,
	DisposalTasksQuery,
	ImagesQuery,
	ProjectsQuery,
	StumpRemovalTasksQuery,
	TicketingTasksQuery,
	TreeRemovalTasksQuery,
	TrucksQuery,
	UserQuery,
} from "src/__generated__/gql/graphql";

type OmitTypename<T> = Omit<T, "__typename" | "_deleted">;
type ExcludeTypename<T> = Exclude<keyof T, "__typename">;
type SatisfiesSchemaKeys<T> = {
	[K in ExcludeTypename<T>]: RxJsonSchema<unknown>["properties"];
};

export type UserDocType = OmitTypename<UserQuery["usersMetadata"][number]>;

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

export type ProjectDocType = OmitTypename<ProjectsQuery["projects"][number]>;
export type TicketingName = OmitTypename<
	ProjectDocType["ticketing_names"][number]
>;
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
			type: ["boolean", "null"],
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
				comment: {
					type: ["string", "null"],
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
export type Images = ImagesQuery["images"][number] &
	Pick<TreeRemovalTaskDocType, "ranges">;

export type TreeRemovalTaskDocType = OmitTypename<
	TreeRemovalTasksQuery["tasks_tree_removal"][number]
>;
type ImagesKeys = SatisfiesSchemaKeys<
	TreeRemovalTaskDocType["images"][number] &
		Pick<TreeRemovalTaskDocType, "ranges">
>;

const imagesSchema = {
	images: {
		type: "array",
		properties: {
			id: {
				type: "string",
			},
			created_at: {
				type: "string",
			},
			updated_at: {
				type: "string",
			},
			latitude: {
				type: "number",
			},
			longitude: {
				type: "number",
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
			_deleted: {
				type: "boolean",
			},
		} satisfies ImagesKeys,
	},
} as const;

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
		...imagesSchema,
	},
	required: ["id"],
} as const;

export type StumpRemovalTaskDocType = OmitTypename<
	StumpRemovalTasksQuery["tasks_stump_removal"][number]
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
		...imagesSchema,
	},
	required: ["id"],
} as const;

export type TicketingTaskDocType = OmitTypename<
	TicketingTasksQuery["tasks_ticketing"][number]
>;

export const ticketingTaskSchema: RxJsonSchema<TicketingTaskDocType> = {
	title: "ticketing task schema",
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
		ticketing_name: {
			type: "string",
		},
		task_ticketing_name: {
			type: "object",
			properties: {
				name: {
					type: "string",
				},
			},
		},
		latitude: {
			type: ["number", "null"],
		},
		longitude: {
			type: ["number", "null"],
		},
		...imagesSchema,
	},
	required: ["id"],
} as const;

export type ContractorDocType = OmitTypename<
	ContractorsQuery["contractors"][number]
>;

export const contractorSchema: RxJsonSchema<ContractorDocType> = {
	title: "contractor schema",
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
	},
	required: ["id"],
} as const;

export type TruckDocType = OmitTypename<TrucksQuery["trucks"][number]>;

export const truckSchema: RxJsonSchema<TruckDocType> = {
	title: "truck schema",
	version: 0,
	type: "object",
	primaryKey: "id",
	properties: {
		id: {
			type: "string",
			maxLength: 100,
		},
		truck_number: {
			type: "string",
		},
		cubic_yardage: {
			type: "string",
		},
	},
	required: ["id"],
} as const;

export type DisposalSiteDocType = OmitTypename<
	DisposalSitesQuery["disposal_sites"][number]
>;

export const disposalSiteSchema: RxJsonSchema<DisposalSiteDocType> = {
	title: "disposal site schema",
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
	},
	required: ["id"],
} as const;

export type DebrisTypeDocType = OmitTypename<
	DebrisTypesQuery["debris_types"][number]
>;

export const debrisTypeSchema: RxJsonSchema<DebrisTypeDocType> = {
	title: "debris type schema",
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
	},
	required: ["id"],
} as const;

export type CollectionTaskDocType = Omit<
	OmitTypename<CollectionTasksQuery["tasks_collection"][number]>,
	"weigh_points"
> & {
	weigh_points: {
		latitude: number;
		longitude: number;
	}[];
};

export const collectionTaskSchema: RxJsonSchema<CollectionTaskDocType> = {
	title: "collection task schema",
	version: 0,
	type: "object",
	primaryKey: "id",
	properties: {
		contractor: {
			type: "string",
		},
		comment: {
			type: ["string", "null"],
		},
		created_at: {
			type: "string",
		},
		debris_type: {
			type: "string",
		},
		id: {
			type: "string",
			maxLength: 100,
		},
		latitude: {
			type: ["number", "null"],
		},
		longitude: {
			type: ["number", "null"],
		},
		truck_id: {
			type: "string",
		},
		updated_at: {
			type: "string",
		},
		weigh_points: {
			type: "array",
			properties: {
				latitude: {
					type: "number",
				},
				longitude: {
					type: "number",
				},
			},
		},
		...imagesSchema,
	},
	required: ["id"],
} as const;

export type DisposalTaskDocType = OmitTypename<
	DisposalTasksQuery["tasks_disposal"][number]
>;

export const disposalTaskSchema: RxJsonSchema<DisposalTaskDocType> = {
	title: "disposal task schema",
	version: 0,
	type: "object",
	primaryKey: "id",
	properties: {
		contractor: {
			type: ["string", "null"],
		},
		comment: {
			type: ["string", "null"],
		},
		created_at: {
			type: "string",
		},
		debris_type: {
			type: "string",
		},
		disposal_site: {
			type: ["string", "null"],
		},
		id: {
			type: "string",
			maxLength: 100,
		},
		latitude: {
			type: ["number", "null"],
		},
		longitude: {
			type: ["number", "null"],
		},
		load_call: {
			type: "number",
		},
		task_collection_id: {
			type: ["string", "null"],
		},
		truck_id: {
			type: ["string", "null"],
		},
		updated_at: {
			type: "string",
		},
		...imagesSchema,
	},
	required: ["id"],
} as const;

export type TaskIdDocType = OmitTypename<AllTaskIdsQuery["task_ids"][number]>;

export const allTaskIdsSchema: RxJsonSchema<TaskIdDocType> = {
	title: "all task ids schema",
	version: 0,
	type: "object",
	primaryKey: "id",
	properties: {
		id: {
			type: "string",
			maxLength: 100,
		},
	},
	required: ["id"],
} as const;
