import axios from "axios";
import type { Options } from "browser-image-compression";
import { resolveRequestDocument } from "graphql-request";
import { hasuraURL } from "../hooks";
import { upsertLogs } from "./graphql-operations";

const maxFileSizeAllowedMB = 0.5;

export const compressionOptions = {
	maxSizeMB: maxFileSizeAllowedMB,
	maxWidthOrHeight: 1280,
	useWebWorker: true,
	fileType: "image/webp",
} satisfies Options;

// 15MB
export const maxUploadFileSizeAllowed = 15 * 1024 * 1024;
export const maxFileSizeAllowed = maxFileSizeAllowedMB * 1024 * 1024;

export async function generateUniqueIdFromJson(
	jsonPayload: object,
): Promise<string> {
	// Convert the JSON payload to a string
	const jsonString = JSON.stringify(jsonPayload);

	// Encode the string as a Uint8Array
	const encoder = new TextEncoder();
	const data = encoder.encode(jsonString);

	// Generate a SHA-256 hash
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);

	// Convert the hash to a hexadecimal string
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");

	// Optionally, shorten the hash to create a more concise ID (e.g., first 12 characters)
	const uniqueId = hashHex.substring(0, 12);

	return uniqueId;
}

type LogPayload = {
	createdAt: string;
	data: object;
	type: string;
	taskId: string;
};

export type LogPayloadFn = (payloads: LogPayload[]) => void;

export function logPayloadToRemoteServer(token: string | null) {
	return async (payloads: LogPayload[]) => {
		const variables = await Promise.all(
			payloads.map(async ({ createdAt, data, type, taskId }) => {
				return {
					id: await generateUniqueIdFromJson(data),
					created_at: createdAt,
					data,
					type,
					task_id: taskId,
				};
			}),
		);

		const data = {
			query: resolveRequestDocument(upsertLogs).query,
			variables: { objects: variables },
		};

		return axios
			.post(hasuraURL, data, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				const errors = res.data?.errors;
				if (errors) throw new Error(errors[0].message);
			});
	};
}

export function httpReq({
	token,
	query,
	variables,
}: {
	token: string | null;
	query: string;
	variables: object;
}) {
	return axios
		.post(
			hasuraURL,
			{ query, variables },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
		.then((res) => {
			const errors = res.data?.errors;
			if (errors) throw new Error(errors[0].message);
			return res.data;
		});
}
