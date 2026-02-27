"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { voteCaption } from "@/app/actions/vote";
import type { ImageRow, CaptionRow } from "../lib/data/types";

interface PostCardProps {
  image: ImageRow;
  topCaption: CaptionRow;
  initialLiked?: boolean;
  initialDisliked?: boolean;
  isAuthenticated?: boolean;
}

const ThumbUp = ({ filled }: { filled: boolean }) => (
  <svg
    className={`h-6 w-6 ${filled ? "fill-green-600 text-green-600" : "fill-none stroke-foreground"}`}
    viewBox="0 0 24 24"
    strokeWidth={filled ? 0 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ThumbDown = ({ filled }: { filled: boolean }) => (
  <svg
    className={`h-6 w-6 ${filled ? "fill-red-600 text-red-600" : "fill-none stroke-foreground"}`}
    viewBox="0 0 24 24"
    strokeWidth={filled ? 0 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
  </svg>
);

export function PostCard({
  image: img,
  topCaption,
  initialLiked = false,
  initialDisliked = false,
  isAuthenticated = true,
}: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isDisliked, setIsDisliked] = useState(initialDisliked);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (voteValue: 1 | -1) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (pending) return;
    setPending(true);
    setError(null);
    const prevLiked = isLiked;
    const prevDisliked = isDisliked;
    const isTogglingOff =
      (voteValue === 1 && prevLiked) || (voteValue === -1 && prevDisliked);
    const valueToSend: 1 | -1 | 0 = isTogglingOff ? 0 : voteValue;
    if (voteValue === 1) {
      setIsLiked(!prevLiked);
      setIsDisliked(false);
    } else {
      setIsDisliked(!prevDisliked);
      setIsLiked(false);
    }
    try {
      const result = await voteCaption(topCaption.id, valueToSend);
      if (result.ok) {
        router.refresh();
      } else {
        setIsLiked(prevLiked);
        setIsDisliked(prevDisliked);
        setError(result.error);
        console.error("Vote failed:", result.error);
      }
    } catch (e) {
      setIsLiked(prevLiked);
      setIsDisliked(prevDisliked);
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      console.error("Vote error:", e);
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-card-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      {/* Caption and Actions Section - Top */}
      <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
        {/* Caption Section - Highlighted at top */}
        <div className="mb-3 sm:mb-4">
          <p className="text-base leading-relaxed text-foreground sm:text-lg">
            {topCaption.content ?? "No caption yet for this image."}
          </p>
        </div>

        {/* Like / Dislike Section */}
        <div className="flex items-center gap-2 border-t border-card-border pt-3 sm:pt-4">
          <button
            type="button"
            onClick={() => handleVote(1)}
            disabled={pending}
            className="flex items-center justify-center rounded-lg p-2.5 transition-all hover:bg-green-50 hover:scale-110 active:scale-95 dark:hover:bg-green-900/20 disabled:opacity-50 disabled:hover:scale-100 sm:p-2"
            aria-label={!isAuthenticated ? "Sign in to like" : isLiked ? "Remove like" : "Like this caption"}
            title={!isAuthenticated ? "Sign in to vote" : undefined}
          >
            <ThumbUp filled={isLiked} />
          </button>
          <button
            type="button"
            onClick={() => handleVote(-1)}
            disabled={pending}
            className="flex items-center justify-center rounded-lg p-2.5 transition-all hover:bg-red-50 hover:scale-110 active:scale-95 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:hover:scale-100 sm:p-2"
            aria-label={!isAuthenticated ? "Sign in to dislike" : isDisliked ? "Remove dislike" : "Dislike this caption"}
            title={!isAuthenticated ? "Sign in to vote" : undefined}
          >
            <ThumbDown filled={isDisliked} />
          </button>
          {Number(topCaption.like_count) > 0 && (
            <div className="ml-auto flex items-center gap-1 rounded-full bg-muted px-3 py-1">
              <svg className="h-3.5 w-3.5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              <span className="text-xs font-semibold text-foreground">
                {Number(topCaption.like_count)}
              </span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Image Section - Bottom */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--card-border)]">
        {img.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.image_description ?? "Image"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No image
          </div>
        )}
      </div>
    </article>
  );
}
