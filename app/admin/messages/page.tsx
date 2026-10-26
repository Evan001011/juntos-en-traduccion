import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getContacts } from "@/lib/data";
import { Messenger } from "@/components/messenger";
import { PageHeader } from "@/components/ui";
import { getLocale, localized } from "@/lib/locale";

export const metadata: Metadata = { title: "Admin messages" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ with?: string }> }) {
  const user = await requireRole("admin");
  const { with: withParam } = await searchParams;
  const contacts = await getContacts(user);
  const locale = await getLocale();
  const l = localized(locale);
  const initial = Number(withParam);
  const initialContactId = contacts.some((contact) => contact.id === initial) ? initial : null;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={l("Safety team", "Equipo de seguridad")}
        title={l("All conversations", "Todas las conversaciones")}
        sub={l(
          "Admins can message any member. Flagged messages are reviewed in the Safety tab, not here.",
          "Los administradores pueden escribir a cualquier miembro. Los mensajes marcados se revisan en Seguridad.",
        )}
      />
      <Messenger me={{ id: user.id, name: user.name, role: user.role }} contacts={contacts} initialContactId={initialContactId} />
    </div>
  );
}
