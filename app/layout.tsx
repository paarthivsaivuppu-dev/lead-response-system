import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Response System",
  description: "Phase 1 foundation for lead response and follow-up."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
