import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PEO Sales Pro",
  description: "PEO Sales Pro web platform for reps, franchisees, and admins."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
