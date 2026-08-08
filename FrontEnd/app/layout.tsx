import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: { template: '%s · Adaptiv', default: 'Adaptiv — Adaptive Learning for Curious Minds' },
  description: 'Adaptiv personalizes every lesson to how you learn best. AI-powered, interactive, and built for real mastery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
