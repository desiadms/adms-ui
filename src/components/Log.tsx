import { useAccessToken } from "@nhost/react";
import { useState } from "react";
import * as R from "remeda";
import { partition, useTasks } from "../hooks";
import { logPayloadToRemoteServer } from "../rxdb/utils";
import { Button } from "./Forms";
import { Spinner } from "./icons";

export function Log() {
  const { results, isFetching } = useTasks();
  const accesToken = useAccessToken();
  const [isLogging, setIsLogging] = useState(false);

  async function forceLog() {
    setIsLogging(true);
    const logFn = logPayloadToRemoteServer(accesToken);

    const ticketingTasks = results["ticketing-tasks"]?.map((task) => {
      return {
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "ticketing-task",
      };
    });

    const collectionTasks = results["collection-tasks"]?.map((task) => {
      return {
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "collection-task",
      };
    });

    const disposalTasks = results["disposal-tasks"]?.map((task) => {
      return {
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "disposal-task",
      };
    });

    const stumpRemovalTasks = results["stump-removal-tasks"]?.map((task) => {
      return {
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "stump-removal-task",
      };
    });

    const treeRemovalTasks = results["tree-removal-tasks"]?.map((task) => {
      return {
        createdAt: task.created_at,
        data: R.omit(task, ["images"]),
        type: "tree-removal-task",
      };
    });

    const allTasks = [
      ...ticketingTasks,
      ...collectionTasks,
      ...disposalTasks,
      ...stumpRemovalTasks,
      ...treeRemovalTasks,
    ];

    const partitioned = partition(allTasks, 4);

    await Promise.all(partitioned.map(logFn));
    setIsLogging(false);
  }

  if (isFetching) return <Spinner />;

  return (
    <Button disabled={isLogging} onClick={forceLog}>
      Force Log Current App State
      {isLogging && <Spinner />}
    </Button>
  );
}
