import Link from "next/link";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { fetchLikedImagesWithCaptions } from "@/lib/data/images";
import { createClient } from "@/lib/supabase/server";

export default async function MyHumor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const result = await fetchLikedImagesWithCaptions(supabase, user.id);

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              <p className="font-medium">Something went wrong</p>
              <p className="mt-1 text-sm opacity-90">{result.error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const items = result.items;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {items.map(({ image: img, topCaption }) => (
            <PostCard
              key={`${img.id}-${topCaption.id}`}
              image={img}
              topCaption={topCaption}
              initialLiked
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-8 py-16 text-center">
              <p className="text-muted">
                You haven&apos;t liked any captions yet.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block text-sm font-medium text-foreground underline underline-offset-2 hover:opacity-90"
              >
                Browse captions on the home page
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
