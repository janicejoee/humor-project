import Link from "next/link";
import { fetchImagesWithTopCaptions } from "@/lib/data/images";
import { createClient } from "@/lib/supabase/server";

const FETCH_TIMEOUT_MS = 10000;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, show only a sign-in call-to-action
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

  const result = await Promise.race([
    fetchImagesWithTopCaptions(),
    new Promise<{ ok: false; error: string }>((resolve) =>
      setTimeout(
        () => resolve({ ok: false, error: "Request timed out. Please try again." }),
        FETCH_TIMEOUT_MS
      )
    ),
  ]);

  const header = (
    <header className="mb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Crackd AI Images &amp; Captions
          </h1>
          <p className="mt-2 text-muted">
            Top-liked caption for each image
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="text-sm font-medium text-foreground">
              {user.email ?? user.user_metadata?.email ?? "Unknown"}
            </p>
          </div>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="inline-flex items-center rounded-lg border border-card-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {header}
          <div className="mt-8 flex items-center justify-center">
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {header}

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
      </div>
    </main>
  );
}
