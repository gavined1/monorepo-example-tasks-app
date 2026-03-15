/**
 * Tasks dashboard: list and create tasks. Scoped by active organization.
 * Organization hooks run only when this route is visited (signed-in user).
 */
import type { selectTasksSchema } from "@tasks-app/api/schema";

import RoutePending from "@/web/components/route-pending";
import { Alert, AlertDescription, AlertTitle } from "@/web/components/ui/alert";
import { Skeleton } from "@/web/components/ui/skeleton";
import { authClient } from "@/web/lib/auth-client";
import { tasksQueryOptions } from "@/web/lib/queries";
import TaskForm from "@/web/routes/~task/components/form";
import TaskList from "@/web/routes/~task/components/list";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/task/")({
  component: TaskDashboard,
  pendingComponent: RoutePending,
});

function TaskDashboard() {
  const { data: session } = authClient.useSession();
  const { data: organizations = [] } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const {
    data: tasks = [],
    isPending,
    isError,
    error,
  } = useQuery({
    ...tasksQueryOptions,
    enabled: !!activeOrganization,
  });

  const orgList = organizations ?? [];
  const hasNoOrgs = session?.user && orgList.length === 0;
  const hasOrgsButNoActive
    = session?.user && orgList.length > 0 && !activeOrganization;

  if (hasNoOrgs) {
    return (
      <Alert>
        <Building2 className="size-4" />
        <AlertTitle>Create your first organization</AlertTitle>
        <AlertDescription>
          Use &quot;Create organization&quot; in the navbar to add an
          organization. Tasks are scoped per organization so you can work with
          your team.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasOrgsButNoActive) {
    return (
      <Alert>
        <Building2 className="size-4" />
        <AlertTitle>Select an organization</AlertTitle>
        <AlertDescription>
          Choose an organization from the navbar to view and manage tasks.
        </AlertDescription>
      </Alert>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load tasks</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Select or create an organization to view tasks."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Tasks
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Add a task below or open one to view or edit.
        </p>
      </header>
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">New task</h2>
        <TaskForm />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Your tasks
          {" "}
          <span className="font-normal">
            (
            {isPending ? "…" : (tasks as selectTasksSchema[])?.length ?? 0}
            )
          </span>
        </h2>
        {isPending
          ? (
              <Skeleton className="h-24 w-full rounded-lg" />
            )
          : (
              <TaskList tasks={(tasks ?? []) as selectTasksSchema[]} />
            )}
      </section>
    </div>
  );
}
