import type { selectTasksSchema } from "@tasks-app/api/schema";

import { buttonVariants } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/web/components/ui/card";
import { cn } from "@/web/lib/utils";
import { Link } from "@tanstack/react-router";

export default function Task({ task }: { task: selectTasksSchema }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <h3
          className={cn(
            "text-lg font-medium",
            task.done && "text-muted-foreground line-through",
          )}
        >
          {task.name}
        </h3>
      </CardHeader>
      <CardContent className="py-0" />
      <CardFooter className="flex gap-3 pt-4">
        <Link
          to="/task/$id"
          params={{ id: task.id.toString() }}
          className={buttonVariants({ variant: "outline" })}
        >
          View
        </Link>
      </CardFooter>
    </Card>
  );
}
