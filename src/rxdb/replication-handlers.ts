import { resolveRequestDocument } from "graphql-request";
import * as R from "remeda";
import type { RxReplicationWriteToMasterRow } from "rxdb";
import type {
	UpsertCollectionTaskMutationVariables,
	UpsertStumpRemovalTaskMutationVariables,
	UpsertTicketingTaskMutationVariables,
	UpsertTreeRemovalTaskMutationVariables,
} from "../__generated__/gql/graphql";
import { extractFilesAndSaveToNhost } from "../hooks";
import {
	projectsDocument,
	queryAllTaskIds,
	queryCollectionTasks,
	queryContractors,
	queryDebrisTypes,
	queryDisposalSites,
	queryDisposalTasks,
	queryStumpRemovalTasks,
	queryTicketingTasks,
	queryTreeRemovalTasks,
	queryTrucks,
	updateUserDocument,
	upsertCollectionTasks,
	upsertDisposalTasks,
	upsertStumpRemovalTasks,
	upsertTicketingTasks,
	upsertTreeRemovalTasks,
	userDocument,
} from "./graphql-operations";
import type {
	CollectionTaskDocType,
	DisposalTaskDocType,
	StumpRemovalTaskDocType,
	TicketingTaskDocType,
	TreeRemovalTaskDocType,
	UserDocType,
} from "./rxdb-schemas";

type TTask =
	| TicketingTaskDocType
	| TreeRemovalTaskDocType
	| StumpRemovalTaskDocType
	| CollectionTaskDocType
	| DisposalTaskDocType;

type TTaskImages = TTask["images"];

export function prepareTaskWriteData(tasks: TTask[]) {
	const nhostImages = tasks.flatMap(
		({ images, id }: { images: TTaskImages; id: string }) =>
			images?.map((image: TTaskImages[number]) => ({ ...image, task_id: id })),
	);

	const variableImages = nhostImages?.map((image) =>
		R.omit(image, ["base64Preview"]),
	);
	const variableTasks = tasks.map((task: TTask) => {
		return "task_ticketing_name" in task
			? R.omit(task, ["images", "task_ticketing_name"])
			: R.omit(task, ["images"]);
	});
	const taskIds = tasks.map(({ id }) => ({ id }));

	return {
		nhostImages,
		variableImages,
		variableTasks,
		taskIds,
	};
}

export function treeRemovalTasksRead() {
	return {
		query: resolveRequestDocument(queryTreeRemovalTasks).query,
		variables: {},
	};
}

export async function treeRemovalTasksWrite(
	_db,
	rows: RxReplicationWriteToMasterRow<TreeRemovalTaskDocType>[],
) {
	const extractedData = rows.map(({ newDocumentState }) => newDocumentState);

	const { nhostImages, taskIds, variableImages, variableTasks } =
		prepareTaskWriteData(extractedData);

	await extractFilesAndSaveToNhost(nhostImages);

	return {
		query: resolveRequestDocument(upsertTreeRemovalTasks).query,
		variables: {
			tasks: variableTasks,
			images: variableImages,
			taskIds,
		} satisfies UpsertTreeRemovalTaskMutationVariables,
	};
}

export function stumpRemovalTasksRead() {
	return {
		query: resolveRequestDocument(queryStumpRemovalTasks).query,
		variables: {},
	};
}

export async function stumpRemovalTasksWrite(
	_db,
	rows: RxReplicationWriteToMasterRow<StumpRemovalTaskDocType>[],
) {
	const extractedData = rows.map(({ newDocumentState }) => newDocumentState);
	const { nhostImages, taskIds, variableImages, variableTasks } =
		prepareTaskWriteData(extractedData);

	await extractFilesAndSaveToNhost(nhostImages);

	return {
		query: resolveRequestDocument(upsertStumpRemovalTasks).query,
		variables: {
			tasks: variableTasks,
			images: variableImages,
			taskIds,
		} satisfies UpsertStumpRemovalTaskMutationVariables,
	};
}

export function ticketingTasksRead() {
	return {
		query: resolveRequestDocument(queryTicketingTasks).query,
		variables: {},
	};
}

export async function ticketingTasksWrite(
	_db,
	rows: RxReplicationWriteToMasterRow<TicketingTaskDocType>[],
) {
	const extractedData = rows.map(({ newDocumentState }) => newDocumentState);

	const { nhostImages, taskIds, variableImages, variableTasks } =
		prepareTaskWriteData(extractedData);

	await extractFilesAndSaveToNhost(nhostImages);

	return {
		query: resolveRequestDocument(upsertTicketingTasks).query,
		variables: {
			tasks: variableTasks,
			images: variableImages,
			taskIds,
		} satisfies UpsertTicketingTaskMutationVariables,
	};
}

export function userRead() {
	return {
		query: resolveRequestDocument(userDocument).query,
		variables: {},
	};
}

export function userWrite(
	_db,
	rows: RxReplicationWriteToMasterRow<UserDocType>[],
) {
	const extractedData = rows.map(({ newDocumentState }) => newDocumentState);
	const user = extractedData[0];

	return {
		query: resolveRequestDocument(updateUserDocument).query,
		variables: {
			id: user?.id,
			first_name: user?.first_name,
			last_name: user?.last_name,
		},
	};
}

export function projectRead() {
	return {
		query: resolveRequestDocument(projectsDocument).query,
		variables: {},
	};
}

export function contractorsRead() {
	return {
		query: resolveRequestDocument(queryContractors).query,
		variables: {},
	};
}

export function trucksRead() {
	return {
		query: resolveRequestDocument(queryTrucks).query,
		variables: {},
	};
}

export function disposalSitesRead() {
	return {
		query: resolveRequestDocument(queryDisposalSites).query,
		variables: {},
	};
}

export function debrisTypesRead() {
	return {
		query: resolveRequestDocument(queryDebrisTypes).query,
		variables: {},
	};
}

export function collectionTasksRead() {
	return {
		query: resolveRequestDocument(queryCollectionTasks).query,
		variables: {},
	};
}

export async function collectionTasksWrite(
	_db,
	rows: RxReplicationWriteToMasterRow<CollectionTaskDocType>[],
) {
	const extractedData = rows.map(({ newDocumentState }) => newDocumentState);
	const images = extractedData.flatMap(({ images, id }) =>
		images.map((image) => ({ ...image, task_id: id })),
	);

	await extractFilesAndSaveToNhost(images);

	const variableImages = images.map((image) =>
		R.omit(image, ["base64Preview"]),
	);
	const variableTasks = extractedData.map((task) => R.omit(task, ["images"]));
	const taskIds = extractedData.map(({ id }) => ({ id }));

	return {
		query: resolveRequestDocument(upsertCollectionTasks).query,
		variables: {
			tasks: variableTasks,
			images: variableImages,
			taskIds,
		} satisfies UpsertCollectionTaskMutationVariables,
	};
}

export function disposalTasksRead() {
	return {
		query: resolveRequestDocument(queryDisposalTasks).query,
		variables: {},
	};
}

export async function disposalTasksWrite(
	_db,
	rows: RxReplicationWriteToMasterRow<DisposalTaskDocType>[],
) {
	const extractedData = rows.map(({ newDocumentState }) => newDocumentState);
	const images = extractedData.flatMap(({ images, id }) =>
		images.map((image) => ({ ...image, task_id: id })),
	);

	await extractFilesAndSaveToNhost(images);

	const variableImages = images.map((image) =>
		R.omit(image, ["base64Preview"]),
	);
	const variableTasks = extractedData.map((task) => R.omit(task, ["images"]));
	const taskIds = extractedData.map(({ id }) => ({ id }));

	return {
		query: resolveRequestDocument(upsertDisposalTasks).query,
		variables: {
			tasks: variableTasks,
			images: variableImages,
			taskIds,
		} satisfies UpsertStumpRemovalTaskMutationVariables,
	};
}

export function allTaskIdsRead() {
	return {
		query: resolveRequestDocument(queryAllTaskIds).query,
		variables: {},
	};
}
