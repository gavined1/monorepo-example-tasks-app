import RoutePending from "@/web/components/route-pending";
import { Alert, AlertDescription, AlertTitle } from "@/web/components/ui/alert";
import { Button, buttonVariants } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { Checkbox } from "@/web/components/ui/checkbox";
import { Input } from "@/web/components/ui/input";
import { Label } from "@/web/components/ui/label";
import {
  createTaskQueryOptions,
  deleteTask,
  queryKeys,
  updateTask,
} from "@/web/lib/queries";
import queryClient from "@/web/lib/query-client";
import { cn } from "@/web/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { patchTasksSchema } from "@tasks-app/api/schema";
import { Controller, useForm } from "react-hook-form";

export const Route = createFileRoute("/task/$id/edit")({
  loader: ({ params }) =>
    queryClient.ensureQueryData(createTaskQueryOptions(params.id)),
  component: RouteComponent,
  pendingComponent: RoutePending,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(createTaskQueryOptions(id));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<patchTasksSchema>({
    defaultValues: data,
    resolver: zodResolver(patchTasksSchema),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries(queryKeys.LIST_TASKS);
      navigate({ to: "/" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.LIST_TASKS.queryKey,
          ...queryKeys.LIST_TASK(id).queryKey,
        ],
      });
      navigate({ to: "/task/$id", params: { id } });
    },
  });

  const pending = deleteMutation.isPending || updateMutation.isPending;
  const error = deleteMutation.error?.message ?? updateMutation.error?.message;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Edit task</CardTitle>
        <CardDescription>Update the task details.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(data => updateMutation.mutate({ id, task: data }))}>
        <CardContent className="flex flex-col gap-5">
          {pending && (
            <span className="text-muted-foreground text-sm">Saving…</span>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-task-name">Name</Label>
            <Input
              id="edit-task-name"
              {...register("name")}
              disabled={pending}
              aria-invalid={!!errors.name}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name?.message && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Controller
              name="done"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-task-done"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={pending}
                    aria-invalid={!!errors.done}
                  />
                  <Label htmlFor="edit-task-done" className="font-normal">
                    Done
                  </Label>
                </div>
              )}
            />
            {errors.done?.message && (
              <p className="text-destructive text-sm">{errors.done.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 pt-4">
          <Button type="submit" disabled={pending || !isDirty}>
            Save
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteMutation.mutate(id)}
            disabled={pending}
          >
            Delete
          </Button>
          <Link
            to="/task/$id"
            params={{ id }}
            className={buttonVariants({ variant: "outline" })}
            aria-disabled={pending}
          >
            Cancel
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
