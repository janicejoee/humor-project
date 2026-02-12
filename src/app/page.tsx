import Link from "next/link";
import { fetchImagesWithTopCaptions } from "@/lib/data/images";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "../components/post-card";

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

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="flex items-center justify-center">
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
      <div className="mx-auto max-w-2xl pb-8">
        <div className="space-y-8 pt-8">
          {items.map(({ image: img, topCaption }) => (
            <PostCard key={img.id} image={img} topCaption={topCaption} />
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
      </div>
    </main>
  );
}
