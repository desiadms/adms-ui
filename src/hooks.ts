import { NhostClient, useAuthenticationStatus } from "@nhost/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RxDocument } from "rxdb";
import { useRxData } from "rxdb-hooks";
import { v4 } from "uuid";
import {
  ContractorDocType,
  DisposalSiteDocType,
  Images,
  ProjectDocType,
  Steps,
  StumpRemovalTaskDocType,
  TreeRemovalTaskDocType,
  TruckDocType,
  UserDocType,
} from "./rxdb/rxdb-schemas";

export const devMode = import.meta.env.MODE === "development";

export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION,
});

export const hasuraURL = import.meta.env.VITE_HASURA_ENDPOINT;

export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOfflineStatus = () => {
      setIsOnline(false);
    };

    const handleOnlineStatus = () => {
      setIsOnline(true);
    };

    window.addEventListener("offline", handleOfflineStatus);
    window.addEventListener("online", handleOnlineStatus);

    return () => {
      window.removeEventListener("offline", handleOfflineStatus);
      window.removeEventListener("online", handleOnlineStatus);
    };
  }, []);
  return isOnline;
}

export function useAuth() {
  const isOnline = useIsOnline();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  return !isOnline
    ? { isAuthenticated: true, isLoading: false, isOffline: true }
    : { isAuthenticated, isLoading, isOffline: false };
}

export async function getGeoLocationHandler() {
  return new Promise<{ latitude: number; longitude: number }>((res, rej) =>
    navigator.geolocation.getCurrentPosition(
      (position) => {
        res({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log(error.message);
        rej(error.message);
      },
    ),
  );
}

export function useGeoLocation() {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  function getGeoLocation() {
    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = position.coords;
        setCoordinates(pos);
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
      },
    );
  }

  useEffect(() => {
    getGeoLocation();
  }, []);

  return { coordinates, isLoading, error, getGeoLocation };
}

export function emailToId(email: string | undefined | null) {
  return email && email.split("@")[0];
}

export function fullName(
  firstName: string | undefined,
  lastName: string | undefined,
) {
  return `${firstName} ${lastName}`;
}

export function userRoles(user: RxDocument<UserDocType> | undefined | null) {
  return (
    user &&
    // eslint-disable-next-line no-underscore-dangle
    Object.entries(user._data)
      .filter(([k, v]) => k.startsWith("role_") && v)
      .map(([k]) => {
        const splitted = k.split("role_")[1];
        return splitted && splitted.replace("_", " ");
      })
      .join(", ")
  );
}

export async function blobToBase64(
  blob: Blob,
  removePrefix?: "removePrefix",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onerror = () => reject(fileReader.error);
    fileReader.onloadend = () => {
      const dataUrl = fileReader.result as string;
      // remove "data:mime/type;base64," prefix from data url
      const base64 = dataUrl.substring(dataUrl.indexOf(",") + 1);
      resolve(removePrefix ? base64 : dataUrl);
    };
    fileReader.readAsDataURL(blob);
  });
}

export function base64toFile(
  base64String: string | undefined | null,
  fileName: string,
  mimeType: string,
): File {
  if (!base64String) {
    throw new Error("No base64 string provided");
  }
  const base64StringNoMime = base64String.substring(
    base64String.indexOf(",") + 1,
  );
  const byteCharacters = atob(base64StringNoMime);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
}

export function keep<T, U>(
  coll: T[],
  mapperFn: (item: T) => U | null | undefined,
): NonNullable<U>[] {
  return coll.reduce((acc: NonNullable<U>[], item: T) => {
    const transformed = mapperFn(item);
    if (transformed !== null && transformed !== undefined) {
      acc.push(transformed as NonNullable<U>);
    }
    return acc;
  }, []);
}

export function saveFilesToNhost(files: { id: string; file: File }[]) {
  return Promise.all(
    files.map(({ id, file }) => nhost.storage.upload({ file, id })),
  );
}

export function humanizeDate(date?: string | number | Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    minute: "numeric",
    hour: "numeric",
  }).format(date ? new Date(date) : new Date());
}

export async function extractFilesAndSaveToNhost(images: Images[]) {
  const blobFiles = images
    .filter((image) => image.base64Preview)
    .map(({ id, base64Preview }) => ({
      id,
      file: base64toFile(base64Preview, "task", "image/png"),
    }));

  const flattenedTaskImages = blobFiles.flat();
  try {
    return await saveFilesToNhost(flattenedTaskImages);
  } catch (error) {
    console.error(error);
  }
}

export type FileForm = { fileInstance: File | undefined };

export async function genTaskImagesMetadata({
  filesData,
  coordinates,
  taken_at_step,
}: {
  filesData: FileForm[];
  coordinates: GeolocationCoordinates;
  taken_at_step?: Steps;
  extraFields?: Record<string, string>;
}) {
  const images = await Promise.all(
    keep(
      filesData,
      (file) => file?.fileInstance && (file.fileInstance[0] as File),
    ).map(async (file) => ({
      id: v4(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      taken_at_step,
      base64Preview: await blobToBase64(file),
    })),
  );
  return images;
}

export function useProject() {
  const query = useCallback((collection) => collection.find(), []);
  const { result, isFetching } = useRxData<ProjectDocType>("project", query);
  return { activeProject: result[0], isFetching };
}

export function useContractors() {
  const query = useCallback((collection) => collection.find(), []);
  const { result, isFetching } = useRxData<ContractorDocType>(
    "contractor",
    query,
  );
  return { contractors: result, isFetching };
}

export function useTrucks() {
  const query = useCallback((collection) => collection.find(), []);
  const { result, isFetching } = useRxData<TruckDocType>("truck", query);
  return { trucks: result, isFetching };
}

export function useDisposalSites() {
  const query = useCallback((collection) => collection.find(), []);
  const { result, isFetching } = useRxData<DisposalSiteDocType>(
    "disposal-site",
    query,
  );
  return { disposalSites: result, isFetching };
}

export function useTreeRemovalTasks(selector?: Record<string, unknown>) {
  const query = useCallback(
    (collection) =>
      collection.find({
        sort: [{ updated_at: "desc" }],
        selector: selector || {},
      }),
    [selector],
  );

  const { result, isFetching } = useRxData<TreeRemovalTaskDocType>(
    "tree-removal-task",
    query,
  );

  return { result, isFetching };
}

export function useStumpRemovalTasks(selector?: Record<string, unknown>) {
  const query = useCallback(
    (collection) =>
      collection.find({
        sort: [{ updated_at: "desc" }],
        selector: selector || {},
      }),
    [selector],
  );

  const { result, isFetching } = useRxData<StumpRemovalTaskDocType>(
    "stump-removal-task",
    query,
  );

  return { result, isFetching };
}

export function useTicketingTasks(selector?: Record<string, unknown>) {
  const query = useCallback(
    (collection) =>
      collection.find({
        sort: [{ updated_at: "desc" }],
        selector: selector || {},
      }),
    [selector],
  );

  const { result, isFetching } = useRxData<StumpRemovalTaskDocType>(
    "ticketing-task",
    query,
  );

  return { result, isFetching };
}

export function useTiketingBlueprint(ticketingId: string) {
  const { activeProject, isFetching } = useProject();

  return {
    ticketingBlueprint: activeProject?.ticketing_names.find(
      (ticketingName) => ticketingName.id === ticketingId,
    ),
    isFetching,
  };
}

export function useTask(taskId: string | undefined) {
  const { result: tree, isFetching: isFetchingTree } = useTreeRemovalTasks({
    id: taskId,
  });
  const { result: stump, isFetching: isFetchingStump } = useStumpRemovalTasks({
    id: taskId,
  });

  const { result: ticketing, isFetching: isFetchingTicketing } =
    useTicketingTasks({
      id: taskId,
    });

  const result = useMemo(() => {
    if (tree.length) {
      return { result: tree[0], type: "Tree" };
    } else if (stump.length) {
      return { result: stump[0], type: "Stump" };
    }

    return { result: ticketing[0], type: "Ticketing" };
  }, [tree, stump, ticketing]);

  const isFetching = isFetchingTree || isFetchingStump || isFetchingTicketing;

  return { ...result, isFetching };
}

export function convertFileSize(fileSize: number): string {
  return (fileSize / 1000000).toFixed(0);
}

export function validateFileSize(
  file: File | undefined,
  maxSize: number,
): string | undefined {
  if (file && file[0]) {
    const { size } = file[0];
    if (size > maxSize) {
      return `File cannot exceed ${convertFileSize(maxSize)}MB`;
    }
  }
}

export function useFilesForm() {
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>();
  const [noFiles, setNoFiles] = useState<boolean>();

  useEffect(() => {
    if (Object.keys(filePreviews || {}).length === 0) setNoFiles(true);
    else setNoFiles(false);
  }, [filePreviews]);

  const onChangeSetFilePreviewFn = async (e, id) => {
    const fileInput = e?.target;
    const file = fileInput?.files?.[0];
    const url = await blobToBase64(file);
    setFilePreviews({ ...filePreviews, [id]: url });
  };

  const validateFileSizeFn = (file, maxSize) => validateFileSize(file, maxSize);

  return {
    noFilesUploaded: noFiles,
    useFilePreviews: [filePreviews, setFilePreviews],
    onChangeSetFilePreview: onChangeSetFilePreviewFn,
    validateFileSize: validateFileSizeFn,
    removePreview: (id) => {
      setFilePreviews((images) => {
        if (images && images[id]) {
          const { [id]: _file, ...rest } = images;
          return rest;
        }
        return images;
      });
    },
  };
}
