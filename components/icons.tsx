import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="1em"
      height="1em"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: P) => (
  <Base {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Base>
);
export const ArrowLeft = (p: P) => (
  <Base {...p}>
    <path d="M20 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Base>
);
export const Calendar = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="4" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </Base>
);
export const Chat = (p: P) => (
  <Base {...p}>
    <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.4 0-2.8-.3-4-1L3 21l1.5-5a8.5 8.5 0 1 1 16.5-4Z" />
    <path d="M8 11h.01M12 11h.01M16 11h.01" />
  </Base>
);
export const Book = (p: P) => (
  <Base {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
    <path d="M4 5.5v16M8 7h8" />
  </Base>
);
export const Star = (p: P) => (
  <Base {...p}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z" />
  </Base>
);
export const Shield = (p: P) => (
  <Base {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.9 7.5-9.5V6Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);
export const Video = (p: P) => (
  <Base {...p}>
    <rect x="3" y="6" width="12" height="12" rx="3" />
    <path d="m15 10 5-3v10l-5-3" />
  </Base>
);
export const Download = (p: P) => (
  <Base {...p}>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Base>
);
export const Globe = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z" />
  </Base>
);
export const Clock = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Base>
);
export const Check = (p: P) => (
  <Base {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Base>
);
export const X = (p: P) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);
export const Sparkles = (p: P) => (
  <Base {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z" />
    <path d="M18.5 15.5 19.3 18l2.2.8-2.2.8-.8 2.4-.8-2.4-2.2-.8 2.2-.8Z" />
    <path d="M5 16l.7 2 2 .7-2 .7L5 21.5l-.7-2.1-2-.7 2-.7Z" />
  </Base>
);
export const Users = (p: P) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 5a3.5 3.5 0 0 1 0 7M18 20a6 6 0 0 0-3-5.2" />
  </Base>
);
export const User = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Base>
);
export const Trophy = (p: P) => (
  <Base {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
    <path d="M8 5H5v2a4 4 0 0 0 4 4M16 5h3v2a4 4 0 0 1-4 4M12 13v5M8 21h8" />
  </Base>
);
export const Search = (p: P) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </Base>
);
export const Plus = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);
export const Send = (p: P) => (
  <Base {...p}>
    <path d="m21 3-7.5 18-4-7-7-4Z" />
    <path d="m21 3-11 11" />
  </Base>
);
export const Lock = (p: P) => (
  <Base {...p}>
    <rect x="4" y="10" width="16" height="11" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" />
  </Base>
);
export const Mail = (p: P) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </Base>
);
export const Menu = (p: P) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);
export const LogOut = (p: P) => (
  <Base {...p}>
    <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <path d="M15 8l4 4-4 4M19 12H9" />
  </Base>
);
export const External = (p: P) => (
  <Base {...p}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M19 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
  </Base>
);
export const Play = (p: P) => (
  <Base {...p}>
    <path d="M8 5.5v13l11-6.5Z" />
  </Base>
);
export const Target = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </Base>
);
export const Clipboard = (p: P) => (
  <Base {...p}>
    <rect x="5" y="4" width="14" height="17" rx="3" />
    <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4" />
  </Base>
);
export const Heart = (p: P) => (
  <Base {...p}>
    <path d="M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10Z" />
  </Base>
);
export const ChevronDown = (p: P) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);
export const ChevronRight = (p: P) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);
export const Printer = (p: P) => (
  <Base {...p}>
    <path d="M7 8V3h10v5" />
    <rect x="4" y="8" width="16" height="9" rx="2" />
    <path d="M7 14h10v7H7z" />
  </Base>
);
export const Volume = (p: P) => (
  <Base {...p}>
    <path d="M4 10v4h4l5 4V6L8 10Z" />
    <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
  </Base>
);
export const Flame = (p: P) => (
  <Base {...p}>
    <path d="M12 21c3.9 0 6.5-2.4 6.5-6.1 0-2.4-1.4-4.6-3.6-6.6.2 1.8-.6 3.1-1.7 3.7.1-3-1.4-5.5-3.4-7-1.6 2.4-4.3 4.6-4.3 8.4C5.5 18 8.2 21 12 21Z" />
    <path d="M9.8 16.2c0-1.4.9-2.4 2.2-3.4.1 1.2.7 1.9 1.4 2.4.6.5.8 1 .8 1.6 0 1-.9 1.8-2.1 1.8-1.3 0-2.3-.9-2.3-2.4Z" />
  </Base>
);
export const Filter = (p: P) => (
  <Base {...p}>
    <path d="M3 5h18l-7 8v6l-4 2v-8Z" />
  </Base>
);
