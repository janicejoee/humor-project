import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { OnboardingTutorialModal } from "@/components/onboarding-tutorial-modal";
import { getCachedUser } from "@/lib/supabase/server";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CrackdTagram",
  description: "Upload images and generate hilarious AI captions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCachedUser();

  return (
    <html lang="en" className={dmSans.variable}>
      <body className="antialiased">
        <Navbar />
        <OnboardingTutorialModal
          userId={user?.id ?? null}
          userCreatedAt={user?.created_at ?? null}
        />
        {children}
      </body>
    </html>
  );
}
