"use client";

import LegalLayout from "@/components/legal/LegalLayout";
import TLDRCard from "@/components/legal/TLDRCard";
import {
  BookOpen,
  UserCheck,
  Shield,
  AlertTriangle,
  Scale,
} from "lucide-react";

export default function TermsPage() {
  const sections = [
    { id: "acceptance", label: "Acceptance", icon: <BookOpen className="w-4 h-4" /> },
    { id: "eligibility", label: "Eligibility", icon: <UserCheck className="w-4 h-4" /> },
    { id: "security", label: "Account Security", icon: <Shield className="w-4 h-4" /> },
    { id: "conduct", label: "Prohibited Conduct", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "liability", label: "Liability", icon: <Scale className="w-4 h-4" /> },
  ];

  return (
    <LegalLayout
      title="Terms of Service"
      updated="June 2026"
      sections={sections}
    >
      <TLDRCard
        bullets={[
          "Use Arcademia honestly.",
          "Keep your Panda and login secure.",
          "Arcademia owns the Arcade universe.",
          "We help you study, but don’t guarantee grades."
        ]}
      />

      <section id="acceptance" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Acceptance</h2>
        <p className="text-slate-700 leading-7">
          By using Arcademia, you agree to these terms. If you do not agree,
          please discontinue use of the platform.
        </p>
      </section>

      <section id="eligibility" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Eligibility</h2>
        <p className="text-slate-700 leading-7">
          Users under 18 must have parental consent. Parents may contact us
          regarding account or data requests.
        </p>
      </section>

      <section id="security" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Account Security</h2>
        <p className="text-slate-700 leading-7">
          You are responsible for protecting your login credentials and Panda
          profile. Do not share passwords.
        </p>
      </section>

      <section id="conduct" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Prohibited Conduct</h2>
        <p className="text-slate-700 leading-7">
          Users may not scrape content, reverse engineer systems, cheat during
          assessments, or attempt to break AI systems.
        </p>
      </section>

      <section id="liability" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
        <p className="text-slate-700 leading-7">
          Arcademia is a study companion. We are not responsible for academic
          outcomes, device failures, or third-party service interruptions.
        </p>
      </section>
    </LegalLayout>
  );
}