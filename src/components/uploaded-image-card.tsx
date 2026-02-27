"use client";

import { useState } from "react";
import type { ImageRow, CaptionRow } from "@/lib/data/types";

interface UploadedImageCardProps {
  image: ImageRow;
}

export function UploadedImageCard({ image }: UploadedImageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [captionIndex, setCaptionIndex] = useState(0);
  const captions: CaptionRow[] = image.captions ?? [];

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-card-border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Image */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[var(--card-border)]"
      >
        {image.url ? (
          <img
            src={image.url}
            alt={image.image_description ?? "Uploaded image"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No image
          </div>
        )}
        {/* Caption count badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {captions.length}
        </div>
        {/* Expand hint */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
          <svg
            className="h-8 w-8 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {expanded ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            )}
          </svg>
        </div>
      </button>

      {/* Expanded captions section */}
      {expanded && (
        <div className="border-t border-card-border">
          {captions.length > 0 ? (
            <div>
              <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
                <p className="text-base leading-relaxed text-foreground sm:text-lg">
                  {captions[captionIndex]?.content ?? "Empty caption"}
                </p>
              </div>
              {captions.length > 1 && (
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
                    {captionIndex + 1} / {captions.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCaptionIndex((i) => i + 1)}
                    disabled={captionIndex === captions.length - 1}
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
          ) : (
            <div className="px-4 py-4 text-center sm:px-5">
              <p className="text-sm text-muted">No captions generated yet.</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
