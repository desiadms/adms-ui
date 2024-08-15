import { useAccessToken } from "@nhost/react";
import { partition, useTasks } from "../hooks";
import { Button } from "./Forms";
import { Spinner } from "./icons";
import { logPayloadToRemoteServer } from "../rxdb/utils";
import { useState } from "react";

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
        data: task,
        type: "ticketing-task",
      };
    });

    const collectionTasks = results["collection-tasks"]?.map((task) => {
      return {
        createdAt: task.created_at,
        data: task,
        type: "collection-task",
      };
    });

    const disposalTasks = results["disposal-tasks"]?.map((task) => {
      return {
        createdAt: task.created_at,
        data: task,
        type: "disposal-task",
      };
    });

    const stumpRemovalTasks = results["stump-removal-tasks"]?.map((task) => {
      return {
        createdAt: task.created_at,
        data: task,
        type: "stump-removal-task",
      };
    });

    const treeRemovalTasks = results["tree-removal-tasks"]?.map((task) => {
      return {
        createdAt: task.created_at,
        data: task,
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
