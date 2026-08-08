"use client";

import LegalLayout from "@/components/legal/LegalLayout";
import TLDRCard from "@/components/legal/TLDRCard";
import {
  Shield,
  Database,
  Lock,
  Cookie,
} from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    { id: "data", label: "Data Collection", icon: <Database className="w-4 h-4" /> },
    { id: "usage", label: "How We Use Data", icon: <Shield className="w-4 h-4" /> },
    { id: "security", label: "Data Security", icon: <Lock className="w-4 h-4" /> },
    { id: "cookies", label: "Cookies", icon: <Cookie className="w-4 h-4" /> },
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      updated="June 2026"
      sections={sections}
    >
      <TLDRCard
        bullets={[
          "We collect hobbies to personalize learning.",
          "We never sell your data.",
          "You control your progress and information."
        ]}
      />

      <section id="data" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
        <p className="text-slate-700 leading-7">
          We collect name, email, hobbies, grade level, and learning preferences
          to personalize your experience.
        </p>
      </section>

      <section id="usage" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">How We Use Data</h2>
        <p className="text-slate-700 leading-7">
          Data is used to generate personalized Hobby Notebooks, track progress,
          and improve AI recommendations.
        </p>
      </section>

      <section id="security" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Data Security</h2>
        <p className="text-slate-700 leading-7">
          We use encryption and secure storage practices to protect your data.
        </p>
      </section>

      <section id="cookies" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Cookies</h2>
        <p className="text-slate-700 leading-7">
          Cookies are used to remember Focus Mode sessions and your fox name.
        </p>
      </section>
    </LegalLayout>
  );
}
