import type { selectTasksSchema } from "@tasks-app/api/schema";

import Task from "./task";

export default function TaskList({ tasks }: { tasks: selectTasksSchema[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-muted-foreground text-sm">
        No tasks yet. Create one above.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-4">
      {tasks.map(task => (
        <li key={task.id}>
          <Task task={task} />
        </li>
      ))}
    </ul>
  );
}
