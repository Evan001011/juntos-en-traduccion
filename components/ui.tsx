import Link from "next/link";
import type { ReactNode } from "react";
import { ACCENTS, type AccentKey } from "@/lib/constants";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const accentStyles: Record<AccentKey, { soft: string; solid: string; text: string; border: string }> = {
  coral: { soft: "bg-coral-soft", solid: "bg-coral", text: "text-[#a02727]", border: "border-[#f0a9a2]" },
  yellow: { soft: "bg-yellow-soft", solid: "bg-yellow", text: "text-[#7a5a0c]", border: "border-[#ecd189]" },
  sage: { soft: "bg-sage-soft", solid: "bg-sage", text: "text-[#52622f]", border: "border-[#c3d19d]" },
  lilac: { soft: "bg-lilac-soft", solid: "bg-lilac", text: "text-[#6e4680]", border: "border-[#dcc2e6]" },
  pink: { soft: "bg-pink-soft", solid: "bg-pink", text: "text-[#963b50]", border: "border-[#f4c1cc]" },
  mint: { soft: "bg-mint-soft", solid: "bg-mint", text: "text-[#37705f]", border: "border-[#b5dfd2]" },
  blue: { soft: "bg-sky-soft", solid: "bg-sky", text: "text-[#326176]", border: "border-[#b8dde9]" },
};

export function accentOf(key?: string | null): AccentKey {
  return (key && key in ACCENTS ? key : "coral") as AccentKey;
}

export function Avatar({
  name,
  color = "coral",
  size = "md",
  className,
}: {
  name: string;
  color?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
  };
  const accent = accentStyles[accentOf(color)];
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white font-extrabold text-ink shadow-sm ring-1 ring-ink/10",
        accent.soft,
        sizes[size],
        className,
      )}
      aria-hidden="true"
      title={name}
    >
      {initials}
    </div>
  );
}

export function Badge({
  children,
  color = "lilac",
  className,
}: {
  children: ReactNode;
  color?: AccentKey;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide",
        accentStyles[color].soft,
        accentStyles[color].text,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Sticker({
  children,
  color = "yellow",
  rotate = -4,
  className,
}: {
  children: ReactNode;
  color?: AccentKey;
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-white px-3.5 py-2 text-xs font-extrabold shadow-[0_3px_0_rgba(48,42,37,0.12)]",
        accentStyles[color].solid,
        color === "yellow" || color === "pink" || color === "mint" ? "text-ink" : "text-white",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

const rainbow = ["text-coral", "text-[#e0a200]", "text-sage", "text-lilac", "text-[#e56d82]", "text-[#4f93a8]"];

export function RainbowText({ text, className }: { text: string; className?: string }) {
  let visibleIndex = 0;
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((char, index) => {
        if (char === " ") return <span key={index}>&nbsp;</span>;
        const color = rainbow[visibleIndex % rainbow.length];
        visibleIndex++;
        return (
          <span
            key={index}
            aria-hidden="true"
            className={cn("inline-block", color)}
            style={{ transform: `rotate(${((index % 5) - 2) * 0.8}deg)` }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = "yellow",
  emoji,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: AccentKey;
  emoji?: string;
}) {
  const style = accentStyles[accent];
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-ink/10 p-5", style.soft)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("text-3xl font-extrabold tracking-tight", style.text)} style={{ fontFamily: "var(--font-display)" }}>
            {value}
          </p>
          <p className="mt-1 text-[12px] font-extrabold uppercase tracking-[0.09em] text-ink-soft">{label}</p>
          {hint ? <p className="mt-1.5 text-xs font-semibold text-ink-soft/80">{hint}</p> : null}
        </div>
        {emoji ? <span className="text-2xl opacity-90">{emoji}</span> : null}
      </div>
    </div>
  );
}

export function ProgressDots({ score, max = 5, color = "coral" }: { score: number; max?: number; color?: AccentKey }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${score} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-5 rounded-full transition",
            i < score ? accentStyles[color].solid : "bg-ink/10",
          )}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  emoji = "🌱",
  title,
  children,
  action,
}: {
  emoji?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border-2 border-dashed border-ink/15 bg-white/55 px-6 py-10 text-center">
      <div className="text-4xl">{emoji}</div>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      {children ? <div className="mx-auto mt-1.5 max-w-md text-sm font-semibold text-ink-soft">{children}</div> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  center = false,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(center ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h2 className="text-[clamp(1.8rem,4vw,2.9rem)] font-semibold leading-[1.02]">{title}</h2>
      {sub ? <p className={cn("mt-4 text-[15px] font-semibold leading-relaxed text-ink-soft", center && "mx-auto")}>{sub}</p> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-soft">{eyebrow}</p> : null}
        <h1 className="mt-1 text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold leading-tight">{title}</h1>
        {sub ? <p className="mt-2 max-w-2xl text-sm font-semibold text-ink-soft">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function DoodleArrow({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true" fill="none">
      <path
        d={flip ? "M112 12C92 48 58 58 16 54" : "M8 12c20 36 54 46 96 42"}
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeDasharray="2 7"
      />
      <path
        d={flip ? "M16 54l13 5-8-12" : "M104 54l-13-5 8-12"}
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 20" className={className} aria-hidden="true" fill="none" preserveAspectRatio="none">
      <path d="M2 13c22-9 36 5 58-2s34 4 56-3 38 5 58-2 22 3 24 3" stroke="currentColor" strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
}

export function CtaLink({ href, children, variant = "coral", className }: { href: string; children: ReactNode; variant?: "coral" | "ink" | "white" | "yellow" | "sage"; className?: string }) {
  return (
    <Link href={href} className={cn("btn", `btn-${variant}`, className)}>
      {children}
    </Link>
  );
}
