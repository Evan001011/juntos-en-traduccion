import Link from "next/link";
import { Logo } from "./brand";
import { HeartMascot, StarMascot } from "./mascots";
import { Mail, Shield } from "./icons";

export function SiteFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-ink/10 bg-paper no-print">
      <div className="pointer-events-none absolute -bottom-8 -right-6 opacity-60">
        <StarMascot size={120} style={{ transform: "rotate(12deg)" }} />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr] lg:px-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[13px] font-semibold leading-relaxed text-ink-soft">
            Free, student-led peer tutoring for our community. Bilingual by design, private by default, and always in your
            corner.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-ink-soft">
            <Shield className="text-base text-sage" />
            Guardian-approved student accounts
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.15em] text-ink-soft">Explore</p>
          <ul className="space-y-2 text-sm font-semibold text-ink-soft">
            <li><Link href="/#mission" className="hover:text-coral">Our mission</Link></li>
            <li><Link href="/#how" className="hover:text-coral">How it works</Link></li>
            <li><Link href="/#impact" className="hover:text-coral">Impact</Link></li>
            <li><Link href="/#faq" className="hover:text-coral">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.15em] text-ink-soft">Portals</p>
          <ul className="space-y-2 text-sm font-semibold text-ink-soft">
            <li><Link href="/login" className="hover:text-coral">Log in</Link></li>
            <li><Link href="/signup/student" className="hover:text-coral">Student sign-up</Link></li>
            <li><Link href="/signup/volunteer" className="hover:text-coral">Volunteer sign-up</Link></li>
            <li><Link href="/login" className="hover:text-coral">Admin access</Link></li>
          </ul>
        </div>

        <div className="rounded-3xl border border-ink/10 bg-yellow-soft p-5">
          <div className="flex items-center gap-2">
            <HeartMascot size={34} />
            <p className="text-sm font-extrabold">Questions from a guardian?</p>
          </div>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-ink-soft">
            Our safety team answers within one school day.
          </p>
          <a href="mailto:hello@juntosentraduccion.org" className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-coral">
            <Mail className="text-sm" />
            hello@juntosentraduccion.org
          </a>
        </div>
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-4 py-5 text-[11px] font-semibold text-ink-soft sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Juntos en Traducción. A student-built community project.</p>
        <div className="flex items-center gap-4">
          <span>COPPA-aware · Guardian consent</span>
          <span className="hidden sm:inline">Bilingual by design · free for every family</span>
        </div>
      </div>
    </footer>
  );
}
