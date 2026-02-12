"use client";

import { useState } from "react";
import type { ImageRow, CaptionRow } from "../lib/data/types";

interface PostCardProps {
  image: ImageRow;
  topCaption: CaptionRow;
  initialLiked?: boolean;
}

export function PostCard({ image: img, topCaption, initialLiked = false }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  return (
    <article className="overflow-hidden rounded-lg border border-card-border bg-card shadow-sm">
      {/* Image Section */}
      <div className="aspect-square w-full overflow-hidden bg-[var(--card-border)]">
        {img.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.image_description ?? "Image"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No image
          </div>
        )}
      </div>

      {/* Like Section */}
      <div className="px-4 py-3">
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleLikeClick}
            className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-foreground/10"
            aria-label={isLiked ? "Unlike this caption" : "Like this caption"}
          >
            {isLiked ? (
              <svg
                className="h-6 w-6 fill-red-500 text-red-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 fill-none stroke-foreground"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
          </button>
          {/* Like Count */}
          {Number(topCaption.like_count) > 0 && (
            <div className="mt-1 px-2">
              <p className="text-sm font-semibold text-foreground">
                {Number(topCaption.like_count)} like{Number(topCaption.like_count) !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Caption Section */}
        <div className="mt-2 px-2">
          <p className="text-sm text-foreground">
            <span>{topCaption.content ?? "No caption yet for this image."}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
