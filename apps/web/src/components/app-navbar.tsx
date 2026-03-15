import OrgSwitcher from "@/web/components/org-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/web/components/ui/avatar";
import { Button } from "@/web/components/ui/button";
import { authClient } from "@/web/lib/auth-client";
import { Link, useLocation } from "@tanstack/react-router";

export default function AppNavbar() {
  const location = useLocation();
  const { data: session } = authClient.useSession();
  return (
    <nav className="border-b border-border">
      <div className="container mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-lg font-semibold hover:opacity-80"
          >
            PubNote
          </Link>
          {location.pathname !== "/" && (
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              Home
            </Link>
          )}
          {session?.user && location.pathname !== "/task" && (
            <Link
              to="/task"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              Tasks
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {session?.user
            ? (
                <>
                  <OrgSwitcher />
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarImage src={session.user.image ?? undefined} alt="" />
                      <AvatarFallback className="text-xs">
                        {session.user.name?.slice(0, 2).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {session.user.name}
                    </span>
                  </div>
                  <Button variant="outline" onClick={() => authClient.signOut()}>
                    Sign Out
                  </Button>
                </>
              )
            : (
                <Button
                  variant="outline"
                  onClick={() =>
                    authClient.signIn.social({
                      provider: "github",
                      callbackURL: "/",
                    })}
                >
                  Sign in with GitHub
                </Button>
              )}
        </div>
      </div>
    </nav>
  );
}
