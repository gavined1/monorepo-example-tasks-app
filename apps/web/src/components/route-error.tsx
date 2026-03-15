import { Alert, AlertDescription, AlertTitle } from "@/web/components/ui/alert";

export default function RouteError({ error }: { error: Error }) {
  return (
    <div className="py-2">
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  );
}
