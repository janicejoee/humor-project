import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const PAGE_SIZE = 10;

type CaptionRow = {
  id: string;
  content: string | null;
  like_count: number;
  is_public: boolean;
};

type ImageRow = {
  id: string;
  url: string | null;
  image_description: string | null;
  is_public: boolean | null;
  captions: CaptionRow[] | null;
};

function getTopCaption(captions: CaptionRow[] | null | undefined): CaptionRow | null {
  const list = captions ?? [];
  if (list.length === 0) return null;
  return [...list].sort((a, b) => {
    const aLikes = Number(a.like_count) ?? 0;
    const bLikes = Number(b.like_count) ?? 0;
    if (bLikes !== aLikes) return bLikes - aLikes;
    return String(a.id).localeCompare(String(b.id));
  })[0];
}

type Props = { searchParams: Promise<{ page?: string }> };

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const { data: imageList, error: listError } = await supabase
    .from("images")
    .select("id")
    .eq("is_public", true)
    .order("created_datetime_utc", { ascending: false });

  if (listError) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 text-sm opacity-90">{listError.message}</p>
        </div>
      </main>
    );
  }

  const ids = (imageList ?? []).map((r) => r.id);
  const allItems: { image: ImageRow; topCaption: CaptionRow }[] = [];

  for (const id of ids) {
    const { data: row, error } = await supabase
      .from("images")
      .select("id, url, image_description, is_public, captions(id, content, like_count, is_public)")
      .eq("id", id)
      .single();
    if (error || !row) continue;
    const image = row as ImageRow;
    const topCaption = getTopCaption(image.captions);
    if (topCaption) allItems.push({ image, topCaption: topCaption });
  }

  allItems.sort(
    (a, b) =>
      Number(b.topCaption.like_count) - Number(a.topCaption.like_count)
  );

  const total = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const items = allItems.slice(from, from + PAGE_SIZE);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Images &amp; captions
          </h1>
          <p className="mt-2 text-muted">
            Top-liked caption for each image
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ image: img, topCaption }) => (
              <article
                key={img.id}
                className="group overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[var(--card-border)]">
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={img.image_description ?? "Image"}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="border-t border-card-border bg-background/50 px-4 py-3">
                  <p className="line-clamp-2 text-sm text-foreground">
                    {topCaption.content ?? "—"}
                  </p>
                  {Number(topCaption.like_count) > 0 && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
                      <span aria-hidden>♥</span>
                      {Number(topCaption.like_count)}
                    </p>
                  )}
                </div>
              </article>
          ))}
        </div>

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-card-border bg-card/50 py-16 text-center">
            <p className="text-muted">
              No public images with captions yet.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="mt-12 flex flex-wrap items-center justify-center gap-2"
            aria-label="Pagination"
          >
            <Link
              href={hasPrev ? `/?page=${page - 1}` : "#"}
              className={`rounded-lg border border-card-border px-4 py-2 text-sm font-medium transition-colors ${
                hasPrev
                  ? "bg-card text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  : "cursor-not-allowed border-transparent bg-transparent text-muted"
              }`}
              aria-disabled={!hasPrev}
            >
              Previous
            </Link>
            <span className="px-2 text-sm text-muted">
              Page {page} of {totalPages}
            </span>
            <Link
              href={hasNext ? `/?page=${page + 1}` : "#"}
              className={`rounded-lg border border-card-border px-4 py-2 text-sm font-medium transition-colors ${
                hasNext
                  ? "bg-card text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  : "cursor-not-allowed border-transparent bg-transparent text-muted"
              }`}
              aria-disabled={!hasNext}
            >
              Next
            </Link>
          </nav>
        )}
      </div>
    </main>
  );
}
