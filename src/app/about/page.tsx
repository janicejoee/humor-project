import { PageLayout } from "@/components/page-layout";

export default async function AboutPage() {
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
            Upload your own images, generate AI-powered captions, and browse what
            others have created. Like the funniest captions and build your collection.
          </p>
          <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">
            Features
          </h3>
          <ul className="list-disc list-inside text-muted space-y-2">
            <li>Upload images and generate hilarious AI captions on the Generate page</li>
            <li>Browse all captions for public images, sorted by like count</li>
            <li>Like or dislike captions to curate your collection</li>
            <li>View your uploads, liked captions, and disliked captions in My Humor</li>
            <li>Secure sign-in with Google</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
