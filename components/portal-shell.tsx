"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "./brand";
import { LanguageToggle, useI18n } from "./i18n";
import { Avatar, Badge } from "./ui";
import { StarMascot } from "./mascots";
import {
  ArrowRight,
  Book,
  Calendar,
  Chat,
  Clipboard,
  Clock,
  Globe,
  Heart,
  LogOut,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from "./icons";

type Role = "student" | "volunteer" | "admin";

type ShellUser = {
  name: string;
  email: string;
  role: Role;
  avatar_color: string;
  approved: number;
};

const ICONS = {
  sparkles: Sparkles,
  search: Search,
  calendar: Calendar,
  book: Book,
  clipboard: Clipboard,
  chat: Chat,
  clock: Clock,
  lessons: Book,
  shield: Shield,
  users: Users,
  trophy: Trophy,
  target: Target,
  heart: Heart,
} as const;

const NAV: Record<Role, Array<{ href: string; key: string; icon: keyof typeof ICONS; badge?: "unread" | "pending" | "flags" }>> = {
  student: [
    { href: "/student", key: "portal.overview", icon: "sparkles" },
    { href: "/student/find", key: "portal.findTutor", icon: "search" },
    { href: "/student/sessions", key: "portal.sessions", icon: "calendar" },
    { href: "/student/learning", key: "portal.learning", icon: "book" },
    { href: "/student/worksheets", key: "portal.worksheets", icon: "clipboard" },
    { href: "/student/messages", key: "portal.messages", icon: "chat", badge: "unread" },
    { href: "/student/availability", key: "portal.availability", icon: "clock" },
  ],
  volunteer: [
    { href: "/volunteer", key: "portal.overview", icon: "sparkles" },
    { href: "/volunteer/sessions", key: "portal.sessions", icon: "calendar" },
    { href: "/volunteer/availability", key: "portal.availability", icon: "clock" },
    { href: "/volunteer/worksheets", key: "portal.worksheets", icon: "clipboard" },
    { href: "/volunteer/lessons", key: "portal.lessons", icon: "lessons" },
    { href: "/volunteer/messages", key: "portal.messages", icon: "chat", badge: "unread" },
  ],
  admin: [
    { href: "/admin", key: "portal.overview", icon: "sparkles" },
    { href: "/admin/volunteers", key: "portal.volunteers", icon: "users", badge: "pending" },
    { href: "/admin/safety", key: "portal.safety", icon: "shield", badge: "flags" },
    { href: "/admin/impact", key: "portal.impact", icon: "trophy" },
    { href: "/admin/messages", key: "portal.messages", icon: "chat", badge: "unread" },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  student: "role.student",
  volunteer: "role.volunteer",
  admin: "role.admin",
};

const ROLE_ACCENT: Record<Role, { soft: string; text: string; dot: string }> = {
  student: { soft: "bg-coral-soft", text: "text-[#a02727]", dot: "bg-coral" },
  volunteer: { soft: "bg-sage-soft", text: "text-[#52622f]", dot: "bg-sage" },
  admin: { soft: "bg-lilac-soft", text: "text-[#6e4680]", dot: "bg-lilac" },
};

export function PortalShell({
  user,
  unread = 0,
  pending = 0,
  flags = 0,
  children,
}: {
  user: ShellUser;
  unread?: number;
  pending?: number;
  flags?: number;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const accent = ROLE_ACCENT[user.role];
  const nav = NAV[user.role];

  const badgeValue = (kind?: "unread" | "pending" | "flags") =>
    kind === "unread" ? unread : kind === "pending" ? pending : kind === "flags" ? flags : 0;

  const isActive = (href: string) => {
    if (href === "/student" || href === "/volunteer" || href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-ink/10 bg-paper px-4 py-5 lg:flex">
        <div className="px-1"><Logo /></div>
        <div className={`mt-5 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${accent.soft} ${accent.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
          {t(ROLE_LABEL[user.role])} {t("portal.overview")}
        </div>
        <nav className="mt-5 flex-1 space-y-0.5" aria-label="Portal navigation">
          {nav.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActive(item.href);
            const count = badgeValue(item.badge);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-bold transition ${
                  active ? "bg-ink text-white shadow-[0_2px_0_rgba(48,42,37,0.15)]" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon className={`text-base ${active ? "text-yellow" : "text-ink-soft group-hover:text-ink"}`} />
                <span className="flex-1">{t(item.key)}</span>
                {count > 0 ? (
                  <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[9px] font-extrabold ${active ? "bg-white text-ink" : "bg-coral text-white"}`}>
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mb-3 rounded-2xl border border-ink/10 bg-cream p-3">
          <div className="flex items-start gap-2">
            <StarMascot size={30} />
            <div>
              <p className="text-[11px] font-extrabold leading-tight">{t("common.translate")}</p>
              <p className="mt-0.5 text-[10px] font-semibold leading-snug text-ink-soft">
                {t("translator.meetingHint")}
              </p>
            </div>
          </div>
          <Link href="/" className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-extrabold text-coral">
            <Globe className="text-xs" /> {t("common.backHome")}
          </Link>
        </div>

        <div className="border-t border-ink/10 pt-3">
          <div className="flex items-center gap-2.5 rounded-xl px-1 py-1.5">
            <Avatar name={user.name} color={user.avatar_color} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-extrabold">{user.name}</p>
              <p className="truncate text-[10px] font-semibold text-ink-soft">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={loggingOut}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-coral-soft hover:text-coral"
              aria-label={t("nav.logout")}
              title={t("nav.logout")}
            >
              <LogOut className="text-base" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
            <LanguageToggle compact />
            {user.role === "volunteer" ? (
              <Badge color={user.approved ? "sage" : "yellow"}>{user.approved ? "Approved" : "Pending"}</Badge>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-ink-soft">
                <Shield className="text-xs text-sage" /> {t("common.privacy")}
              </span>
            )}
          </div>
        </div>
      </aside>

      <div className="lg:ml-[248px]">
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/92 backdrop-blur-md no-print">
          <div className="mx-auto flex h-[62px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="lg:hidden"><Logo compact /></span>
              <div className="hidden items-center gap-2 sm:flex">
                <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
                  {t(ROLE_LABEL[user.role])} portal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:block"><LanguageToggle compact /></div>
              <Link
                href={`/${user.role}/messages`}
                className="relative grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-white text-ink-soft transition hover:text-ink"
                aria-label={t("portal.messages")}
              >
                <Chat className="text-base" />
                {unread > 0 ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-coral" /> : null}
              </Link>
              <div className="hidden items-center gap-2 rounded-full border border-ink/10 bg-white py-1 pl-1 pr-3 sm:flex">
                <Avatar name={user.name} color={user.avatar_color} size="xs" />
                <span className="max-w-[110px] truncate text-[11px] font-extrabold">{user.name.split(" ")[0]}</span>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-white text-ink-soft transition hover:border-coral/30 hover:text-coral lg:hidden"
                aria-label={t("nav.logout")}
              >
                <LogOut className="text-base" />
              </button>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto px-3 pb-2.5 pt-1 hide-scrollbar lg:hidden">
            {nav.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isActive(item.href);
              const count = badgeValue(item.badge);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition ${
                    active ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink-soft"
                  }`}
                >
                  <Icon className="text-sm" />
                  {t(item.key)}
                  {count > 0 ? <span className="rounded-full bg-coral px-1.5 text-[8px] text-white">{count}</span> : null}
                </Link>
              );
            })}
          </div>
          {user.role === "volunteer" && !user.approved ? (
            <div className="border-t border-yellow/40 bg-yellow-soft/80 px-4 py-2 text-center text-[11px] font-bold text-[#7a5a0c]">
              Your volunteer application is pending admin review. You can set availability and browse lessons now — matches unlock after approval.
            </div>
          ) : null}
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pb-8 pt-2 text-[10px] font-semibold text-ink-soft/70 sm:px-6 lg:px-8">
          <span>Juntos en Traducción · {new Date().getFullYear()}</span>
          <Link href="/" className="inline-flex items-center gap-1 hover:text-coral">
            <ArrowRight className="text-xs" /> Public site
          </Link>
        </div>
      </div>
    </div>
  );
}
