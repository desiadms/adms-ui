import { hasuraURL } from "../hooks";
import { insertLogs } from "./graphql-operations";
import { resolveRequestDocument } from "graphql-request";
import axios from "axios";

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
};

export type LogPayloadFn = (payloads: LogPayload[]) => void;

export function logPayloadToRemoteServer(
  token: string | null,
  activeProject: string | null,
) {
  return (payloads: LogPayload[]) => {
    const variables = payloads.map(async ({ createdAt, data }) => {
      return {
        id: await generateUniqueIdFromJson(data),
        createdAt,
        data,
        projectId: activeProject,
      };
    });

    axios.post(
      hasuraURL,
      {
        query: resolveRequestDocument(insertLogs).query,
        variables,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  };
}
