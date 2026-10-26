import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth";
import { countUnread } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("student");
  const unread = await countUnread(user.id);
  return (
    <PortalShell user={{ ...user, role: "student" }} unread={unread}>
      {children}
    </PortalShell>
  );
}
