import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageLayout } from "@/components/page-layout";

export default async function AboutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <PageLayout
      title="About"
      description="Learn more about this project"
    >
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <div className="rounded-2xl border border-card-border bg-card p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Welcome to Janice's Humor Project
          </h2>
          <p className="text-muted mb-4">
            This is a platform for exploring and sharing humorous images and captions.
            On the home page you can browse all captions sorted by likes; like captions
            with the heart and they appear in My Humor.
          </p>
          <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
            Features
          </h3>
          <ul className="list-disc list-inside text-muted space-y-2">
            <li>Browse all captions for public images, sorted by like count</li>
            <li>Like captions to save them; your liked captions appear in My Humor</li>
            <li>My Humor shows your liked images and captions in a grid</li>
            <li>Secure sign-in with Google</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
