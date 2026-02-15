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
}: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isDisliked, setIsDisliked] = useState(initialDisliked);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (voteValue: 1 | -1) => {
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
    <article className="overflow-hidden rounded-lg border border-card-border bg-card shadow-sm">
      {/* Image Section - 4:3 aspect so caption has more presence */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--card-border)]">
        {img.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.image_description ?? "Image"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No image
          </div>
        )}
      </div>

      {/* Like / Dislike Section */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleVote(1)}
            disabled={pending}
            className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-foreground/10 disabled:opacity-50"
            aria-label={isLiked ? "Remove like" : "Like this caption"}
          >
            <ThumbUp filled={isLiked} />
          </button>
          <button
            type="button"
            onClick={() => handleVote(-1)}
            disabled={pending}
            className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-foreground/10 disabled:opacity-50"
            aria-label={isDisliked ? "Remove dislike" : "Dislike this caption"}
          >
            <ThumbDown filled={isDisliked} />
          </button>
          {Number(topCaption.like_count) > 0 && (
            <div className="ml-2">
              <p className="text-sm font-semibold text-foreground">
                {Number(topCaption.like_count)} like{Number(topCaption.like_count) !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Caption Section */}
        <div className="mt-3 px-2 pb-3">
          <p className="text-base leading-relaxed text-foreground">
            {topCaption.content ?? "No caption yet for this image."}
          </p>
        </div>
      </div>
    </article>
  );
}
