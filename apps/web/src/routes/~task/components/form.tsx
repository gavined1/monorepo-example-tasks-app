import { Alert, AlertDescription, AlertTitle } from "@/web/components/ui/alert";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { Input } from "@/web/components/ui/input";
import { Label } from "@/web/components/ui/label";
import { createTask, queryKeys } from "@/web/lib/queries";
import { cn } from "@/web/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertTasksSchema } from "@tasks-app/api/schema";
import { useForm } from "react-hook-form";

export default function TaskForm() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<insertTasksSchema>({
    defaultValues: {
      name: "",
      done: false,
    },
    resolver: zodResolver(insertTasksSchema),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries(queryKeys.LIST_TASKS);
    },
    onSettled: () => {
      setTimeout(() => {
        setFocus("name");
      });
    },
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle>New task</CardTitle>
        <CardDescription>Add a task to the list.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(data => createMutation.mutate(data))} className="flex flex-col">
        <CardContent className="flex flex-col gap-5 pb-6">
          {createMutation.error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">
                {createMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-form-name">Name</Label>
            <Input
              id="task-form-name"
              {...register("name")}
              disabled={createMutation.isPending}
              aria-invalid={!!errors.name}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name?.message && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-3 pt-4">
          <Button type="submit" disabled={createMutation.isPending}>
            Create
          </Button>
          {createMutation.isPending && (
            <span className="text-muted-foreground text-sm">Creating…</span>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
