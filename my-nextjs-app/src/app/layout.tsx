import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hello World",
  description: "A simple Hello World app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
