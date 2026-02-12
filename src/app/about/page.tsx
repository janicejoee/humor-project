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
            Browse through the gallery to see top-liked captions for each image.
          </p>
          <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
            Features
          </h3>
          <ul className="list-disc list-inside text-muted space-y-2">
            <li>Browse a curated collection of images</li>
            <li>View top-liked captions for each image</li>
            <li>Secure authentication with Google</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
