import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getContacts } from "@/lib/data";
import { Messenger } from "@/components/messenger";
import { PageHeader } from "@/components/ui";
import { getLocale, localized } from "@/lib/locale";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function VolunteerMessagesPage({ searchParams }: { searchParams: Promise<{ with?: string }> }) {
  const user = await requireRole("volunteer");
  const { with: withParam } = await searchParams;
  const contacts = await getContacts(user);
  const locale = await getLocale();
  const l = localized(locale);
  const initial = Number(withParam);
  const initialContactId = contacts.some((contact) => contact.id === initial) ? initial : null;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={l("Safe communication", "Comunicación segura")}
        title={l("Messages", "Mensajes")}
        sub={l(
          "Keep every conversation about learning inside Juntos. Contact details are stripped automatically for student safety.",
          "Mantén cada conversación sobre aprendizaje dentro de Juntos. Los datos de contacto se eliminan automáticamente.",
        )}
      />
      <Messenger me={{ id: user.id, name: user.name, role: user.role }} contacts={contacts} initialContactId={initialContactId} />
    </div>
  );
}
