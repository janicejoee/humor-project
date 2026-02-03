import { supabase } from "@/lib/supabase/client";

type Caption = {
  id: string;
  content: string | null;
  like_count: number;
  is_public: boolean;
};

type ImageWithCaptions = {
  id: string;
  url: string | null;
  image_description: string | null;
  is_public: boolean | null;
  captions: Caption[] | null;
};

export default async function Home() {
  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, image_description, is_public, captions(id, content, like_count, is_public)")
    .eq("is_public", true)
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 text-sm opacity-90">{error.message}</p>
        </div>
      </main>
    );
  }

  const allImages = (images ?? []) as ImageWithCaptions[];
  const items = allImages.filter((img) => {
    const publicCaptions = (img.captions ?? []).filter((c) => c.is_public);
    return publicCaptions.length > 0;
  });

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
          {items.map((img) => {
            const publicCaptions = (img.captions ?? []).filter((c) => c.is_public);
            const topCaption = [...publicCaptions].sort(
              (a, b) => Number(b.like_count) - Number(a.like_count)
            )[0];
            return (
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
                  {topCaption.like_count > 0 && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
                      <span aria-hidden>♥</span>
                      {topCaption.like_count}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-card-border bg-card/50 py-16 text-center">
            <p className="text-muted">
              No public images with captions yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
