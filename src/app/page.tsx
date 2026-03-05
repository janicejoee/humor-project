import Link from "next/link";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { fetchAllCaptionsWithImages, type CaptionSort } from "@/lib/data/images";
import { getCachedClient, getCachedUser } from "@/lib/supabase/server";
import { PostCard } from "@/components/post-card";
import Loading from "./loading";

const FETCH_TIMEOUT_MS = 10000;
const ITEMS_PER_PAGE = 30;
// No imageLimit - fetch all images so pagination works correctly
// Pagination is by caption cards (items), not images
const CACHE_REVALIDATE_SECONDS = 60;

async function HomeFeed({
  userId,
  page,
  sort,
  isAuthenticated,
}: {
  userId: string | null;
  page: number;
  sort: CaptionSort;
  isAuthenticated: boolean;
}) {
  const itemsOffset = (page - 1) * ITEMS_PER_PAGE;

  const cachedFetch = unstable_cache(
    async () => {
      const client = await getCachedClient();
      return fetchAllCaptionsWithImages(client, userId, {
        itemsLimit: ITEMS_PER_PAGE,
        itemsOffset,
        sort,
      });
    },
    ["home-captions", userId ?? "anon", String(page), sort],
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

  const buildPageHref = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (pageNumber > 1) params.set("page", String(pageNumber));
    if (sort !== "like_desc") params.set("sort", sort);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  const buildSortHref = (nextSort: CaptionSort) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (nextSort !== "like_desc") params.set("sort", nextSort);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <>
      {/* Page Header */}
      <div className="pt-6 pb-4 sm:pt-8 sm:pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Discover Humor
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Browse captions and sort by likes or upload date. Like the ones that make you laugh!
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:mt-4 sm:text-sm">
          <span className="text-muted">Sort by:</span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={buildSortHref("like_desc")}
              className={`rounded-full border px-3 py-1 ${
                sort === "like_desc"
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-card-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              Most liked
            </Link>
            <Link
              href={buildSortHref("like_asc")}
              className={`rounded-full border px-3 py-1 ${
                sort === "like_asc"
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-card-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              Least liked
            </Link>
            <Link
              href={buildSortHref("date_newest")}
              className={`rounded-full border px-3 py-1 ${
                sort === "date_newest"
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-card-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              Newest
            </Link>
            <Link
              href={buildSortHref("date_oldest")}
              className={`rounded-full border px-3 py-1 ${
                sort === "date_oldest"
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-card-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              Oldest
            </Link>
          </div>
        </div>
        {page > 1 && (
          <div className="mt-2 sm:mt-3">
            <span className="text-xs text-muted sm:text-sm">Page {page}</span>
          </div>
        )}
      </div>

      {/* Captions Feed */}
      {items.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {items.map(({ image: img, topCaption, userHasVoted, userHasDisliked }) => (
            <PostCard
              key={`${img.id}-${topCaption.id}`}
              image={img}
              topCaption={topCaption}
              initialLiked={userHasVoted ?? false}
              initialDisliked={userHasDisliked ?? false}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center py-12 sm:py-20">
          <div className="w-full max-w-md rounded-2xl border border-dashed border-card-border bg-card/50 px-4 py-12 text-center sm:px-8 sm:py-16">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted sm:mb-4 sm:h-16 sm:w-16">
              <svg className="h-6 w-6 text-muted-foreground sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base font-medium text-foreground sm:text-lg">No captions yet</p>
            <p className="mt-2 text-sm text-muted sm:text-base">
              Check back later for new images and captions!
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {items.length === ITEMS_PER_PAGE && (
        <div className="mt-8 flex flex-col items-stretch gap-3 border-t border-card-border pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-center sm:gap-3 sm:pt-8">
          {page > 1 && (
            <Link
              href={buildPageHref(page - 1)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-all hover:bg-foreground hover:text-background hover:shadow-sm sm:py-2.5"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Link>
          )}
          <span className="py-2 text-center text-sm text-muted sm:px-0">Page {page}</span>
          <Link
            href={buildPageHref(page + 1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-all hover:bg-foreground hover:text-background hover:shadow-sm sm:py-2.5"
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
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const user = await getCachedUser();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page ?? "1", 10) || 1);
  const rawSort = params?.sort ?? "like_desc";
  const allowedSorts: CaptionSort[] = ["like_desc", "like_asc", "date_newest", "date_oldest"];
  const sort: CaptionSort = allowedSorts.includes(rawSort as CaptionSort)
    ? (rawSort as CaptionSort)
    : "like_desc";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6 sm:pb-12">
        <Suspense fallback={<Loading />}>
          <HomeFeed
            userId={user?.id ?? null}
            page={page}
            sort={sort}
            isAuthenticated={!!user}
          />
        </Suspense>
      </div>
    </main>
  );
}
