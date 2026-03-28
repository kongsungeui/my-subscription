import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Subscription",
  description: "Personal subscription dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const themeClass =
    settings.themeMode === "DARK" ? "theme-dark" : "theme-light";

  return (
    <html
      lang="ko"
      className={`${themeClass} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
