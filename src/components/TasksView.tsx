import { TaskType } from "./common";

export function TasksView() {
  return (
    <div className="flex flex-col gap-2">
      <TaskType name="field monitor" to="/tasks/field-monitor" />
      {/* <TaskType name="field collections" to="/tasks/field-collections" />
      <TaskType name="field disposal" to="/tasks/field-disposal" /> */}
    </div>
  );
}
