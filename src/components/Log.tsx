import {
  useAccessToken,
  useAuthenticationStatus,
  useUserData,
} from "@nhost/react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  extractFilesAndSaveToNhost,
  partition,
  useFetchAllTasksLog,
} from "../hooks";
import { logPayloadToRemoteServer } from "../rxdb/utils";
import { Button } from "./Forms";
import { Spinner } from "./icons";

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
  const { isFetching, allUnsynchedTasks } = useFetchAllTasksLog();
  const [isLoggingData, setIsLoggingData] = useState(false);

  const userData = useUserData();
  const accesToken = useAccessToken();
  const { isAuthenticated, error } = useAuthenticationStatus();

  const [showRawData, setShowRawData] = useState<boolean>();
  const [authData, setAuthData] = useState<object | null>();

  async function forceLog() {
    const confirm = window.confirm("Are you sure you want to synch you tasks?");

    if (!confirm) return;

    setIsLoggingData(true);
    const logFn = logPayloadToRemoteServer(accesToken);

    const partitioned = partition(allUnsynchedTasks, 4);

    const requests = Promise.all(
      partitioned.map(async (tasks) => {
        const payload = tasks.map((task) => task.task);
        const images = tasks.flatMap((task) =>
          task.images.map((image) => ({ ...image, task_id: task.task.taskId })),
        );
        await extractFilesAndSaveToNhost(images);
        return logFn(payload);
      }),
    );

    toast
      .promise(
        requests,
        {
          loading: "Sending tasks to dev team",
          success: "Tasks sent to dev team",
          error: (error) => `Failed to synch tasks: ${error.message}`,
        },
        {
          duration: 5000,
        },
      )
      .then(() => setIsLoggingData(false))
      .catch(() => setIsLoggingData(false));
  }

  function showRawDataHandler() {
    !nothingToSync && setShowRawData((prev) => !prev);
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

  const nothingToSync = allUnsynchedTasks.length === 0;

  if (isFetching) return <Spinner />;

  return (
    <div>
      <div className="flex flex-col gap-4">
        {!nothingToSync && (
          <Button
            className="uppercase bg-yellow-400"
            disabled={isLoggingData}
            onClick={forceLog}
          >
            Send unsynched tasks to dev team
            {isLoggingData && <Spinner />}
          </Button>
        )}
        <div>
          <Button onClick={showRawDataHandler}>
            Show unsynched tasks
            {nothingToSync ? " (All synched)" : ""}
          </Button>
          {showRawData ? (
            <>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(showRawData, null, 2),
                  );
                  toast.success("Copied all snippets to clipboard");
                }}
                className="my-2 w-full p-1 bg-slate-200 rounded-sm"
              >
                Copy All
              </button>

              <div className="flex flex-col gap-2">
                {allUnsynchedTasks.map((row, index) => (
                  <PreJson key={index} data={row} />
                ))}
              </div>
            </>
          ) : (
            ""
          )}
        </div>
        <div>
          <Button onClick={showAuthData}>Show auth data</Button>
          {authData && (
            <div className="mt-2">
              <PreJson data={authData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
