import Link from "next/link";
import { StarMascot } from "./mascots";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Juntos en Traducción home">
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl border-2 border-ink/10 bg-yellow-soft transition group-hover:-rotate-6">
        <StarMascot size={30} />
        <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-coral" />
      </span>
      <span className="leading-none">
        <span className="block text-[22px] font-semibold tracking-[-0.03em]" style={{ fontFamily: "var(--font-display)" }}>
          Juntos
        </span>
        {!compact ? <span className="font-hand -mt-0.5 block text-[15px] font-semibold leading-none text-coral">en traducción</span> : null}
      </span>
    </Link>
  );
}
