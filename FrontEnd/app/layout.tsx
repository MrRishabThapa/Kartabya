import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "Arcademia | Start your learning journey",
  description: "Set up your personalized Arcademia learning journey.",
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
