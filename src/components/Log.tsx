import {
  useAccessToken,
  useAuthenticationStatus,
  useUserData,
} from "@nhost/react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import * as R from "remeda";
import { partition, useAllSynchedTaskIds, useTasks } from "../hooks";
import { logPayloadToRemoteServer } from "../rxdb/utils";
import { Button } from "./Forms";
import { Spinner } from "./icons";

function useFetchAllTasks() {
  const { results, isFetching } = useTasks();
  const { result: synchedTaskIds } = useAllSynchedTaskIds();

  const parseTasksFn = useCallback(() => {
    const ticketingTasks = results.ticketing?.map((task) => {
      return {
        taskId: task.id,
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "ticketing-task",
      };
    });

    const collectionTasks = results.collection?.map((task) => {
      return {
        taskId: task.id,
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "collection-task",
      };
    });

    const disposalTasks = results.disposal?.map((task) => {
      return {
        taskId: task.id,
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "disposal-task",
      };
    });

    const stumpRemovalTasks = results.stump?.map((task) => {
      return {
        taskId: task.id,
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "stump-removal-task",
      };
    });

    const treeRemovalTasks = results.tree?.map((task) => {
      return {
        taskId: task.id,
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "tree-removal-task",
      };
    });

    return [
      ...ticketingTasks,
      ...collectionTasks,
      ...disposalTasks,
      ...stumpRemovalTasks,
      ...treeRemovalTasks,
    ].filter((task) =>
      synchedTaskIds.every((synched) => synched.id !== task.taskId),
    );
  }, [results, synchedTaskIds]);

  return { parseTasksFn, isFetching };
}

function PreJson({ data }: { data: unknown }) {
  const content = JSON.stringify(data, null, 4);
  return (
    <div className="rounded-sm bg-slate-200 p-1 overflow-hidden whitespace-pre-wrap">
      <pre
        className="text-xs"
        onClick={() => {
          navigator.clipboard.writeText(content);
          toast.success("Copied code snippet to clipboard");
        }}
      >
        {content}
      </pre>
    </div>
  );
}

export function Log() {
  const { isFetching, parseTasksFn } = useFetchAllTasks();
  const [isLogging, setIsLogging] = useState(false);

  const userData = useUserData();
  const accesToken = useAccessToken();
  const { isAuthenticated, error } = useAuthenticationStatus();

  const [rowData, setRowData] = useState<unknown[] | null>();
  const [authData, setAuthData] = useState<object | null>();

  async function forceLog() {
    const confirm = window.confirm("Are you sure you want to synch you tasks?");

    if (!confirm) return;

    setIsLogging(true);
    const logFn = logPayloadToRemoteServer(accesToken);
    const allTasks = parseTasksFn();

    const partitioned = partition(allTasks, 4);

    const requests = Promise.all(partitioned.map(logFn));
    toast.promise(requests, {
      loading: "Sending tasks to dev team",
      success: "Tasks sent to dev team",
      error: "Failed to send tasks to dev team",
    });

    await requests;

    setIsLogging(false);
  }

  function showRawData() {
    const allTasks = parseTasksFn();
    setRowData(rowData ? null : allTasks);
  }

  function showAuthData() {
    setAuthData(
      authData
        ? null
        : {
            isAuthenticated,
            error,
            userData,
          },
    );
  }

  const nothingToSync = !rowData || rowData?.length === 0;

  if (isFetching) return <Spinner />;

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div>
          <Button onClick={showAuthData}>Show auth data</Button>
          {authData && (
            <div className="mt-2">
              <PreJson data={authData} />
            </div>
          )}
        </div>
        <div>
          <Button onClick={showRawData}>
            Show unsynched tasks
            {nothingToSync ? " (All synched)" : ""}
          </Button>
          {rowData?.length && rowData.length > 0 ? (
            <>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(rowData, null, 2),
                  );
                  toast.success("Copied all snippets to clipboard");
                }}
                className="my-2 w-full p-1 bg-slate-200 rounded-sm"
              >
                Copy All
              </button>

              <div className="flex flex-col gap-2">
                {rowData.map((row, index) => (
                  <PreJson key={index} data={row} />
                ))}
              </div>
            </>
          ) : (
            ""
          )}
        </div>
        {!nothingToSync && (
          <Button
            bgColor="bg-amber-700"
            disabled={isLogging}
            onClick={forceLog}
          >
            Send unsynched tasks to dev team
            {isLogging && <Spinner />}
          </Button>
        )}
      </div>
    </div>
  );
}
