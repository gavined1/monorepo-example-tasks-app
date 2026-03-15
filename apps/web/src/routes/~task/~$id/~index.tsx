import RoutePending from "@/web/components/route-pending";
import { buttonVariants } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { Separator } from "@/web/components/ui/separator";
import dateFormatter from "@/web/lib/date-formatter";
import { createTaskQueryOptions } from "@/web/lib/queries";
import queryClient from "@/web/lib/query-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/task/$id/")({
  loader: ({ params }) =>
    queryClient.ensureQueryData(createTaskQueryOptions(params.id)),
  component: RouteComponent,
  pendingComponent: RoutePending,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(createTaskQueryOptions(id));

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{data.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Done:
          {" "}
          {data.done ? "Yes" : "No"}
        </p>
        <Separator className="my-1" />
        <div className="flex flex-col gap-1 text-muted-foreground text-sm">
          <p>
            Updated:
            {" "}
            {dateFormatter.format(new Date(data.updatedAt))}
          </p>
          <p>
            Created:
            {" "}
            {dateFormatter.format(new Date(data.createdAt))}
          </p>
        </div>
      </CardContent>
      <CardFooter className="gap-3 pt-4">
        <Link
          to="/task/$id/edit"
          params={{ id }}
          className={buttonVariants({ variant: "outline" })}
        >
          Edit
        </Link>
      </CardFooter>
    </Card>
  );
}
