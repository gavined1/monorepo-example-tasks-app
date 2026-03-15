/**
 * PubNote landing page. No auth or organization requests — purely informational.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, PenLine, Users } from "lucide-react";

import { Button, buttonVariants } from "@/web/components/ui/button";
import { authClient } from "@/web/lib/auth-client";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex flex-col gap-16 py-12 sm:py-16">
      <header className="flex flex-col gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          PubNote
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Simple note-taking with your team. Organize tasks, share in
          workspaces, and get things done.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {session?.user
            ? (
                <Link
                  to="/task"
                  className={buttonVariants({ size: "lg" })}
                >
                  Open app
                </Link>
              )
            : (
                <Button
                  size="lg"
                  onClick={() =>
                    authClient.signIn.social({
                      provider: "github",
                      callbackURL: "/task",
                    })}
                >
                  Sign in with GitHub
                </Button>
              )}
        </div>
      </header>

      <section className="grid gap-8 sm:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PenLine className="size-5" />
          </div>
          <h2 className="font-semibold">Notes & tasks</h2>
          <p className="text-muted-foreground text-sm">
            Create and manage tasks in one place. Mark them done and keep
            everything in sync.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <h2 className="font-semibold">Organized</h2>
          <p className="text-muted-foreground text-sm">
            Group work by organization. Switch contexts and focus on what
            matters now.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <h2 className="font-semibold">Team-ready</h2>
          <p className="text-muted-foreground text-sm">
            Share an organization with others. Notes and tasks stay visible
            to everyone in the workspace.
          </p>
        </div>
      </section>
    </div>
  );
}
