import Link from "next/link";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { UploadedImageCard } from "@/components/uploaded-image-card";
import { fetchLikedImagesWithCaptions, fetchDislikedImagesWithCaptions, fetchUserUploadedImages } from "@/lib/data/images";
import type { ImageWithTopCaption, ImageRow } from "@/lib/data/types";
import { createClient } from "@/lib/supabase/server";

export default async function MyHumor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [likedResult, dislikedResult, uploadsResult] = await Promise.all([
    fetchLikedImagesWithCaptions(supabase, user.id),
    fetchDislikedImagesWithCaptions(supabase, user.id),
    fetchUserUploadedImages(supabase, user.id),
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
  const uploadedImages = uploadsResult.ok ? uploadsResult.items : [];
  const totalItems = likedItems.length + dislikedItems.length + uploadedImages.length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:pb-12">
        {/* Page Header */}
        <div className="pt-6 pb-6 sm:pt-8 sm:pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            My Humor
          </h1>
          <p className="mt-2 text-base text-muted sm:mt-3 sm:text-lg">
            Your uploads, liked captions, and disliked captions
          </p>
          {totalItems > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-4">
              <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent dark:bg-accent/20 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {uploadedImages.length} uploaded
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
                {likedItems.length} liked
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                </svg>
                {dislikedItems.length} disliked
              </div>
            </div>
          )}
        </div>

        {/* My Uploads Section */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 sm:h-10 sm:w-10">
              <svg className="h-4 w-4 text-accent sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">My Uploads</h2>
              <p className="text-xs text-muted sm:text-sm">{uploadedImages.length} image{uploadedImages.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {uploadedImages.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {uploadedImages.map((img: ImageRow) => (
                <UploadedImageCard key={`upload-${img.id}`} image={img} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-4 py-12 text-center sm:px-8 sm:py-20">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:mb-4 sm:h-16 sm:w-16">
                <svg className="h-6 w-6 text-accent sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-base font-medium text-foreground sm:text-lg">No uploads yet</p>
              <p className="mt-2 text-sm text-muted sm:text-base">
                Upload an image and generate some hilarious captions!
              </p>
              <Link
                href="/generate"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:opacity-90 sm:mt-6 sm:w-auto"
              >
                Generate captions
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Link>
            </div>
          )}
        </section>

        {/* Divider */}
        {uploadedImages.length > 0 && (likedItems.length > 0 || dislikedItems.length > 0) && (
          <div className="my-6 border-t border-card-border sm:my-8" />
        )}

        {/* Liked Section */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 sm:h-10 sm:w-10">
              <svg className="h-4 w-4 text-green-600 dark:text-green-400 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">Liked</h2>
              <p className="text-xs text-muted sm:text-sm">{likedItems.length} caption{likedItems.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {likedItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
            <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-4 py-12 text-center sm:px-8 sm:py-20">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 sm:mb-4 sm:h-16 sm:w-16">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 0 1 1.789 2.894l-3.5 7A2 2 0 0 1 15.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 0 0-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2.5" />
                </svg>
              </div>
              <p className="text-base font-medium text-foreground sm:text-lg">No liked captions yet</p>
              <p className="mt-2 text-sm text-muted sm:text-base">
                Start exploring and like captions that make you laugh!
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:opacity-90 sm:mt-6 sm:w-auto"
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
          <div className="my-6 border-t border-card-border sm:my-8" />
        )}

        {/* Disliked Section */}
        <section>
          <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 sm:h-10 sm:w-10">
              <svg className="h-4 w-4 text-red-600 dark:text-red-400 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">Disliked</h2>
              <p className="text-xs text-muted sm:text-sm">{dislikedItems.length} caption{dislikedItems.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {dislikedItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
            <div className="rounded-2xl border border-dashed border-card-border bg-card/50 px-4 py-12 text-center sm:px-8 sm:py-20">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:mb-4 sm:h-16 sm:w-16">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 0 1-1.789-2.894l3.5-7A2 2 0 0 1 8.736 3h4.018a2 2 0 0 1 .485.06l3.76.94m-7 10v5a2 2 0 0 0 2 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2.5" />
                </svg>
              </div>
              <p className="text-base font-medium text-foreground sm:text-lg">No disliked captions yet</p>
              <p className="mt-2 text-sm text-muted sm:text-base">
                Your disliked captions will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
