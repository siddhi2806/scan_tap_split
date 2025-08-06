import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bill Splitter",
  description: "Scan. Tap. Split. - A simple bill splitting app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
