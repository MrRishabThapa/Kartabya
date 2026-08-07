"use client";

import { Shield } from "lucide-react";

interface Props {
  bullets: string[];
}

export default function TLDRCard({ bullets }: Props) {
  return (
    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 mb-10">

      <div className="flex items-center gap-2 mb-4 text-[#7C3AED] font-semibold">
        <Shield className="w-5 h-5" />
        TL;DR
      </div>

      <ul className="space-y-2 text-sm text-slate-700">
        {bullets.map((b, i) => (
          <li key={i}>• {b}</li>
        ))}
      </ul>
    </div>
  );
}