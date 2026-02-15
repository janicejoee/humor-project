import Link from "next/link";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { fetchAllCaptionsWithImages } from "@/lib/data/images";
import { getCachedClient, getCachedUser } from "@/lib/supabase/server";
import { PostCard } from "../components/post-card";
import Loading from "./loading";

const FETCH_TIMEOUT_MS = 10000;
const ITEMS_PER_PAGE = 30;
const IMAGE_LIMIT = 100;
const CACHE_REVALIDATE_SECONDS = 60;

async function HomeFeed({ userId, page }: { userId: string; page: number }) {
  const itemsOffset = (page - 1) * ITEMS_PER_PAGE;

  const cachedFetch = unstable_cache(
    async () => {
      const client = await getCachedClient();
      return fetchAllCaptionsWithImages(client, userId, {
        imageLimit: IMAGE_LIMIT,
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
      <div className="space-y-8 pt-8">
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

      {items.length === 0 && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-8 py-16 text-center">
            <p className="text-muted">
              No images with captions yet. Check back later!
            </p>
          </div>
        </div>
      )}

      {items.length === ITEMS_PER_PAGE && (
        <div className="mt-8 flex justify-center gap-4">
          {page > 1 && (
            <Link
              href={page === 2 ? "/" : `/?page=${page - 1}`}
              className="rounded-lg border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:opacity-90"
            >
              Previous
            </Link>
          )}
          <Link
            href={`/?page=${page + 1}`}
            className="rounded-lg border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:opacity-90"
          >
            Next
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
          <div className="w-full rounded-2xl border border-card-border bg-card p-8 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Crackd AI Images &amp; Captions
            </h1>
            <p className="mt-3 text-muted">
              Sign in with Google to view images and captions.
            </p>
            <Link
              href="/auth/login"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:opacity-90"
            >
              Continue with Google
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page ?? "1", 10) || 1);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl pb-8">
        <Suspense fallback={<Loading />}>
          <HomeFeed userId={user.id} page={page} />
        </Suspense>
      </div>
    </main>
  );
}
