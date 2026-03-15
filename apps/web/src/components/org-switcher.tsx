/**
 * Organization switcher and create-org form for Better Auth organization plugin.
 * Shows current org, dropdown to switch, and "Create organization" when signed in.
 */
import { Button } from "@/web/components/ui/button";
import { Input } from "@/web/components/ui/input";
import { Label } from "@/web/components/ui/label";
import { authClient } from "@/web/lib/auth-client";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const slugFromName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function OrgSwitcher() {
  const { data: organizations = [] } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setActive = useCallback(
    async (organizationId: string) => {
      setError(null);
      const { error: err } = await authClient.organization.setActive({
        organizationId,
      });
      if (err)
        setError(err.message ?? "Failed to switch organization");
      setOpen(false);
    },
    [],
  );

  const createOrg = useCallback(async () => {
    if (!name.trim() || !slug.trim())
      return;
    setCreating(true);
    setError(null);
    const { data, error: err } = await authClient.organization.create({
      name: name.trim(),
      slug: slug.trim(),
    });
    setCreating(false);
    if (err) {
      setError(err.message ?? "Failed to create organization");
      return;
    }
    if (data?.id) {
      await authClient.organization.setActive({ organizationId: data.id });
      setName("");
      setSlug("");
      setCreateOpen(false);
    }
  }, [name, slug]);

  const syncSlug = (value: string) => {
    setName(value);
    setSlug(slugFromName(value));
  };

  const orgList = organizations ?? [];

  // Auto-set first org as active when user has orgs but none selected
  useEffect(() => {
    const list = organizations ?? [];
    if (list.length > 0 && !activeOrganization) {
      authClient.organization.setActive({ organizationId: list[0].id });
    }
  }, [organizations, activeOrganization]);

  return (
    <div className="relative flex items-center gap-2">
      {orgList.length === 0 && !createOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreateOpen(true)}
          data-icon="inline-start"
        >
          <Building2 />
          Create organization
        </Button>
      )}

      {createOpen && (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">New organization</span>
          </div>
          <div className="grid gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={e => syncSlug(e.target.value)}
                placeholder="Acme Inc"
                className="h-8"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="acme-inc"
                className="h-8"
              />
            </div>
          </div>
          {error && (
            <p className="text-destructive text-xs">{error}</p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={createOrg}
              disabled={creating || !name.trim() || !slug.trim()}
              data-icon="inline-start"
            >
              <Check />
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setName("");
                setSlug("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {orgList.length > 0 && !createOpen && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(!open)}
            data-icon="inline-end"
          >
            {activeOrganization?.name ?? "Select organization"}
            <ChevronDown className="size-4" />
          </Button>
          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                role="button"
                tabIndex={-1}
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                onKeyDown={e => e.key === "Escape" && setOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 min-w-48 rounded-md border border-border bg-card py-1 shadow-md">
                {orgList.map(org => (
                  <button
                    key={org.id}
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => setActive(org.id)}
                  >
                    {org.id === activeOrganization?.id && (
                      <Check className="size-4 text-primary" />
                    )}
                    <span className={org.id === activeOrganization?.id ? "font-medium" : ""}>
                      {org.name}
                    </span>
                  </button>
                ))}
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    setOpen(false);
                    setCreateOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                  Create organization
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
