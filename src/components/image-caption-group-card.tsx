"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { voteCaption } from "@/app/actions/vote";
import type { ImageRow, CaptionWithVoteState } from "@/lib/data/types";

interface ImageCaptionGroupCardProps {
  image: ImageRow;
  captions: CaptionWithVoteState[];
  isAuthenticated?: boolean;
}

const ThumbUp = ({ filled }: { filled: boolean }) => (
  <svg
    className={`h-5 w-5 ${filled ? "fill-green-600 text-green-600" : "fill-none stroke-foreground"}`}
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
    className={`h-5 w-5 ${filled ? "fill-red-600 text-red-600" : "fill-none stroke-foreground"}`}
    viewBox="0 0 24 24"
    strokeWidth={filled ? 0 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
  </svg>
);

export function ImageCaptionGroupCard({
  image,
  captions,
  isAuthenticated = true,
}: ImageCaptionGroupCardProps) {
  const router = useRouter();
  const [captionIndex, setCaptionIndex] = useState(0);
  const [voteState, setVoteState] = useState(() =>
    captions.map((entry) => ({
      ...entry,
      currentLikeCount: Number(entry.caption.like_count) ?? 0,
      pending: false,
      error: null as string | null,
    }))
  );

  const handleVote = async (index: number, voteValue: 1 | -1) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const current = voteState[index];
    if (!current || current.pending) return;

    const previous = { ...current };
    const isTogglingOff =
      (voteValue === 1 && current.userHasVoted) ||
      (voteValue === -1 && current.userHasDisliked);

    const valueToSend: 1 | -1 | 0 = isTogglingOff ? 0 : voteValue;

    setVoteState((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const nextLiked = voteValue === 1 ? !item.userHasVoted : false;
        const nextDisliked = voteValue === -1 ? !item.userHasDisliked : false;
        const countDelta =
          Number(nextLiked) -
          Number(item.userHasVoted) -
          Number(nextDisliked) +
          Number(item.userHasDisliked);
        return {
          ...item,
          userHasVoted: nextLiked,
          userHasDisliked: nextDisliked,
          currentLikeCount: item.currentLikeCount + countDelta,
          pending: true,
          error: null,
        };
      })
    );

    try {
      const result = await voteCaption(current.caption.id, valueToSend);
      if (!result.ok) {
        setVoteState((prev) =>
          prev.map((item, itemIndex) =>
            itemIndex === index
              ? { ...previous, pending: false, error: result.error, currentLikeCount: previous.currentLikeCount }
              : item
          )
        );
        return;
      }
      setVoteState((prev) =>
        prev.map((item, itemIndex) => (itemIndex === index ? { ...item, pending: false } : item))
      );
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setVoteState((prev) =>
        prev.map((item, itemIndex) =>
          itemIndex === index
            ? { ...previous, pending: false, error: msg, currentLikeCount: previous.currentLikeCount }
            : item
        )
      );
    }
  };

  const activeCaption = voteState[captionIndex];

  if (!activeCaption) {
    return null;
  }

  return (
    <article className="overflow-hidden rounded-xl border border-card-border bg-card shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--card-border)]">
        {image.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.image_description ?? "Image"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No image</div>
        )}
      </div>

      <div>
        <div className="px-4 py-3 sm:px-5 sm:py-4">
          <p className="text-sm leading-relaxed text-foreground sm:text-base">
            {activeCaption.caption.content ?? "No caption text."}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleVote(captionIndex, 1)}
              disabled={activeCaption.pending}
              className="rounded-md p-1.5 transition hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
              aria-label={!isAuthenticated ? "Sign in to like" : "Like caption"}
            >
              <ThumbUp filled={activeCaption.userHasVoted} />
            </button>
            <button
              type="button"
              onClick={() => handleVote(captionIndex, -1)}
              disabled={activeCaption.pending}
              className="rounded-md p-1.5 transition hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              aria-label={!isAuthenticated ? "Sign in to dislike" : "Dislike caption"}
            >
              <ThumbDown filled={activeCaption.userHasDisliked} />
            </button>
            <span className="ml-auto text-xs font-medium text-muted">
              {activeCaption.currentLikeCount} likes
            </span>
          </div>
          {activeCaption.error && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
              {activeCaption.error}
            </p>
          )}
        </div>

        {voteState.length > 1 && (
          <div className="flex items-center justify-between border-t border-card-border px-4 py-2.5 sm:px-5">
            <button
              type="button"
              onClick={() => setCaptionIndex((i) => i - 1)}
              disabled={captionIndex === 0}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-card-border/40 disabled:pointer-events-none disabled:opacity-30 sm:text-sm"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>
            <span className="text-xs tabular-nums text-muted sm:text-sm">
              {captionIndex + 1} / {voteState.length}
            </span>
            <button
              type="button"
              onClick={() => setCaptionIndex((i) => i + 1)}
              disabled={captionIndex === voteState.length - 1}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-card-border/40 disabled:pointer-events-none disabled:opacity-30 sm:text-sm"
            >
              Next
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
