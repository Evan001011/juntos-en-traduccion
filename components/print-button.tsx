"use client";

import { Printer } from "./icons";

export function PrintButton({ label = "Print report" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-white btn-sm no-print">
      <Printer className="text-sm" /> {label}
    </button>
  );
}
