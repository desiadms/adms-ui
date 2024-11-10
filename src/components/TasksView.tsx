import { Link } from "@tanstack/react-router";
import { TaskType } from "./common";

export function TasksView() {
	return (
		<div className="flex flex-col gap-2">
			<Link to="/tasks/field-monitor" className="flex-shrink-0">
				<TaskType name="field monitor" />
			</Link>
			<Link to="/tasks/truck-tasks" className="flex-shrink-0">
				<TaskType name="Truck Tasks" />
			</Link>
		</div>
	);
}
