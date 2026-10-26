import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth";
import { countUnread, getAdminMetrics } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");
  const unread = await countUnread(user.id);
  const metrics = await getAdminMetrics();
  return (
    <PortalShell
      user={{ ...user, role: "admin" }}
      unread={unread}
      pending={metrics.pendingVolunteers}
      flags={metrics.flaggedMessages}
    >
      {children}
    </PortalShell>
  );
}
