"use client";

import { ReactNode } from "react";
import Button from "@/components/shared/Button";

interface Props {
  title: string;
  updated: string;
  sections: { id: string; label: string; icon: ReactNode }[];
  children: ReactNode;
}

export default function LegalLayout({
  title,
  updated,
  sections,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">

      <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="flex">

          {/* Sidebar */}
          <aside className="w-72 bg-slate-50 border-r border-slate-100 p-6 space-y-4">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 text-sm text-slate-600 hover:text-brand-primary transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary-tint text-brand-primary text-xs font-semibold">
                  {index + 1}
                </div>
                {section.icon}
                <span>{section.label}</span>
              </a>
            ))}
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-10 overflow-y-auto max-h-[80vh]">

            <h1 className="text-3xl font-bold text-slate-900">
              {title}
            </h1>

            <p className="text-sm text-slate-500 mt-2 mb-8">
              Updated {updated}
            </p>

            {children}
          </main>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-100 px-8 py-4 bg-white">
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <input type="checkbox" />
            Send copy to my email
          </label>

          <Button>
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
}
