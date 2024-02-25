import { Link } from "@tanstack/react-router";
import { TaskType } from "./common";

export function TasksView() {
  return (
    <div className="flex flex-col gap-2">
      <Link to="/tasks/field-monitor" className="flex-shrink-0">
        <TaskType name="field monitor" />
      </Link>
      {/* <TaskType name="field collections" to="/tasks/field-collections" />
      <TaskType name="field disposal" to="/tasks/field-disposal" /> */}
    </div>
  );
}
