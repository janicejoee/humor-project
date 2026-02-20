import Link from "next/link";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { fetchAllCaptionsWithImages } from "@/lib/data/images";
import { getCachedClient, getCachedUser } from "@/lib/supabase/server";
import { PostCard } from "../components/post-card";
import Loading from "./loading";

const FETCH_TIMEOUT_MS = 10000;
const ITEMS_PER_PAGE = 30;
// No imageLimit - fetch all images so pagination works correctly
// Pagination is by caption cards (items), not images
const CACHE_REVALIDATE_SECONDS = 60;

async function HomeFeed({ userId, page }: { userId: string; page: number }) {
  const itemsOffset = (page - 1) * ITEMS_PER_PAGE;

  const cachedFetch = unstable_cache(
    async () => {
      const client = await getCachedClient();
      return fetchAllCaptionsWithImages(client, userId, {
        // No imageLimit - fetch all images, then paginate by caption cards
        itemsLimit: ITEMS_PER_PAGE,
        itemsOffset,
      });
    },
    ["home-captions", userId, String(page)],
    { revalidate: CACHE_REVALIDATE_SECONDS }
  );

  const result = await Promise.race([
    cachedFetch(),
    new Promise<{ ok: false; error: string }>((resolve) =>
      setTimeout(
        () => resolve({ ok: false, error: "Request timed out. Please try again." }),
        FETCH_TIMEOUT_MS
      )
    ),
  ]);

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center px-4 py-10">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 text-sm opacity-90">{result.error}</p>
        </div>
      </div>
    );
  }

  const items = result.items;

  return (
    <>
      {/* Page Header */}
      <div className="pt-8 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Discover Humor
        </h1>
        <p className="mt-2 text-muted">
          Browse captions sorted by popularity. Like the ones that make you laugh!
        </p>
        {page > 1 && (
          <div className="mt-3">
            <span className="text-sm text-muted">Page {page}</span>
          </div>
        )}
      </div>

      {/* Captions Feed */}
      {items.length > 0 ? (
        <div className="space-y-6">
          {items.map(({ image: img, topCaption, userHasVoted, userHasDisliked }) => (
            <PostCard
              key={`${img.id}-${topCaption.id}`}
              image={img}
              topCaption={topCaption}
              initialLiked={userHasVoted ?? false}
              initialDisliked={userHasDisliked ?? false}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center py-20">
          <div className="w-full max-w-md rounded-2xl border border-dashed border-card-border bg-card/50 px-8 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground">No captions yet</p>
            <p className="mt-2 text-muted">
              Check back later for new images and captions!
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {items.length === ITEMS_PER_PAGE && (
        <div className="mt-12 flex items-center justify-center gap-3 border-t border-card-border pt-8">
          {page > 1 && (
            <Link
              href={page === 2 ? "/" : `/?page=${page - 1}`}
              className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-foreground hover:text-background hover:shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Link>
          )}
          <span className="text-sm text-muted">Page {page}</span>
          <Link
            href={`/?page=${page + 1}`}
            className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-foreground hover:text-background hover:shadow-sm"
          >
            Next
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCachedUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full rounded-2xl border border-card-border bg-card p-10 shadow-lg">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-red-100 dark:from-green-900/30 dark:to-red-900/30">
                <svg className="h-10 w-10 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                CrackdTagram
              </h1>
              <p className="mt-4 text-lg text-muted">
                Discover and share humorous images and captions
              </p>
              <p className="mt-2 text-muted">
                Sign in with Google to start exploring
              </p>
              <Link
                href="/auth/login"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-base font-medium text-background transition-all hover:scale-105 hover:shadow-lg"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page ?? "1", 10) || 1);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
        <Suspense fallback={<Loading />}>
          <HomeFeed userId={user.id} page={page} />
        </Suspense>
      </div>
    </main>
  );
}
