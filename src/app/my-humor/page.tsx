import Link from "next/link";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { fetchLikedImagesWithCaptions, fetchDislikedImagesWithCaptions } from "@/lib/data/images";
import type { ImageWithTopCaption } from "@/lib/data/types";
import { createClient } from "@/lib/supabase/server";

export default async function MyHumor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [likedResult, dislikedResult] = await Promise.all([
    fetchLikedImagesWithCaptions(supabase, user.id),
    fetchDislikedImagesWithCaptions(supabase, user.id),
  ]);

  if (!likedResult.ok) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              <p className="font-medium">Something went wrong</p>
              <p className="mt-1 text-sm opacity-90">{likedResult.error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!dislikedResult.ok) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
              <p className="font-medium">Something went wrong</p>
              <p className="mt-1 text-sm opacity-90">{dislikedResult.error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const likedItems = likedResult.items;
  const dislikedItems = dislikedResult.items;
  const totalItems = likedItems.length + dislikedItems.length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-12">
        {/* Page Header */}
        <div className="pt-8 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            My Humor
          </h1>
          <p className="mt-3 text-lg text-muted">
            Your collection of liked and disliked captions
          </p>
          {totalItems > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
                {likedItems.length} liked
              </div>
              <div className="flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                </svg>
                {dislikedItems.length} disliked
              </div>
            </div>
          )}
        </div>

        {/* Liked Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Liked</h2>
              <p className="text-sm text-muted">{likedItems.length} caption{likedItems.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {likedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedItems.map(({ image: img, topCaption }: ImageWithTopCaption) => (
                <PostCard
                  key={`liked-${img.id}-${topCaption.id}`}
                  image={img}
                  topCaption={topCaption}
                  initialLiked
                  initialDisliked={false}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-8 py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 0 1 1.789 2.894l-3.5 7A2 2 0 0 1 15.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 0 0-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2.5" />
                </svg>
              </div>
              <p className="text-lg font-medium text-foreground">No liked captions yet</p>
              <p className="mt-2 text-muted">
                Start exploring and like captions that make you laugh!
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
              >
                Browse captions
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </section>

        {/* Divider */}
        {likedItems.length > 0 && dislikedItems.length > 0 && (
          <div className="my-8 border-t border-card-border" />
        )}

        {/* Disliked Section */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Disliked</h2>
              <p className="text-sm text-muted">{dislikedItems.length} caption{dislikedItems.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {dislikedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dislikedItems.map(({ image: img, topCaption }: ImageWithTopCaption) => (
                <PostCard
                  key={`disliked-${img.id}-${topCaption.id}`}
                  image={img}
                  topCaption={topCaption}
                  initialLiked={false}
                  initialDisliked
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-8 py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 0 1-1.789-2.894l3.5-7A2 2 0 0 1 8.736 3h4.018a2 2 0 0 1 .485.06l3.76.94m-7 10v5a2 2 0 0 0 2 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2.5" />
                </svg>
              </div>
              <p className="text-lg font-medium text-foreground">No disliked captions yet</p>
              <p className="mt-2 text-muted">
                Your disliked captions will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
