"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";

const API_BASE = "https://api.almostcrackd.ai/pipeline";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

const ACCEPT_STRING = Array.from(ACCEPTED_TYPES).join(",");

type CaptionRecord = Record<string, unknown> & { content?: string; id?: string };

type PipelineStatus =
  | "idle"
  | "uploading"
  | "registering"
  | "generating"
  | "done";

const STATUS_LABEL: Record<PipelineStatus, string> = {
  idle: "",
  uploading: "Uploading image…",
  registering: "Registering image…",
  generating: "Generating captions — this may take a moment…",
  done: "",
};

async function getAccessToken(): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("You must be logged in to generate captions.");
  }
  return session.access_token;
}

async function authFetch(path: string, body: object, token: string): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res;
}

export default function GeneratePage() {
  const [file, setFile] = useState<File | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionRecord[]>([]);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = pipelineStatus !== "idle" && pipelineStatus !== "done";

  const handleFile = useCallback((selected: File | null) => {
    if (!selected) return;
    setTypeError(null);

    if (!ACCEPTED_TYPES.has(selected.type)) {
      setTypeError(
        `"${selected.type || "unknown"}" is not supported. Please upload a JPEG, PNG, WebP, GIF (it's pronounced JIFF), or HEIC image.`,
      );
      return;
    }

    setFile(selected);
    setCaptions([]);
    setCaptionIndex(0);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      handleFile(dropped ?? null);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleGenerate = async () => {
    if (!file) return;
    setError(null);
    setCaptions([]);

    try {
      const token = await getAccessToken();

      // Step 1: Get presigned upload URL
      setPipelineStatus("uploading");
      const presignedRes = await authFetch(
        "/generate-presigned-url",
        { contentType: file.type },
        token,
      );
      const { presignedUrl, cdnUrl } = await presignedRes.json();

      // Step 2: Upload image bytes to S3
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error(`Image upload failed (${uploadRes.status})`);
      }

      // Step 3: Register image in the pipeline
      setPipelineStatus("registering");
      const registerRes = await authFetch(
        "/upload-image-from-url",
        { imageUrl: cdnUrl, isCommonUse: false },
        token,
      );
      const { imageId } = await registerRes.json();

      // Step 4: Generate captions
      setPipelineStatus("generating");
      const captionsRes = await authFetch(
        "/generate-captions",
        { imageId },
        token,
      );
      const captionsData = await captionsRes.json();
      setCaptions(Array.isArray(captionsData) ? captionsData : [captionsData]);
      setPipelineStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPipelineStatus("idle");
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setCaptions([]);
    setCaptionIndex(0);
    setError(null);
    setPipelineStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 pb-8 sm:pb-12">
        {/* Header */}
        <div className="pt-6 pb-6 sm:pt-8 sm:pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Generate Caption
          </h1>
          <p className="mt-2 text-base text-muted sm:mt-3 sm:text-lg">
            Upload an image and let AI craft a hilarious caption for it.
          </p>
        </div>

        {/* Upload Area */}
        {!preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`group w-full cursor-pointer rounded-2xl border-2 border-dashed px-4 py-16 text-center transition-all sm:px-8 sm:py-24 ${
              isDragging
                ? "border-accent bg-accent/5"
                : "border-card-border bg-card/50 hover:border-muted hover:bg-card/80"
            }`}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
              <svg
                className="h-8 w-8 text-accent sm:h-10 sm:w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-foreground sm:text-lg">
              {isDragging ? "Drop your image here" : "Drag & drop an image here"}
            </p>
            <p className="mt-2 text-sm text-muted">
              or click to browse &middot; JPEG, PNG, WebP, GIF (it&apos;s pronounced JIFF), HEIC
            </p>
            {typeError && (
              <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                {typeError}
              </p>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_STRING}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </button>
        ) : (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full object-contain"
                style={{ maxHeight: "28rem" }}
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
                aria-label="Remove image"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="border-t border-card-border bg-card/80 px-4 py-3 backdrop-blur">
                <p className="truncate text-sm font-medium text-foreground">{file?.name}</p>
                <p className="text-xs text-muted">
                  {file && (file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-base font-semibold text-background shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
              >
                {isBusy ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {STATUS_LABEL[pipelineStatus]}
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Caption
                  </>
                )}
              </button>
              {error && (
                <p className="text-center text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            {/* Caption Result — one at a time */}
            {captions.length > 0 && (
              <article className="overflow-hidden rounded-xl border border-card-border bg-card shadow-sm">
                {/* Caption text */}
                <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
                  <p className="text-base leading-relaxed text-foreground sm:text-lg">
                    {typeof captions[captionIndex]?.content === "string"
                      ? captions[captionIndex].content
                      : JSON.stringify(captions[captionIndex])}
                  </p>
                </div>

                {/* Navigation bar */}
                {captions.length > 1 && (
                  <div className="flex items-center justify-between border-t border-card-border px-5 py-3 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setCaptionIndex((i) => i - 1)}
                      disabled={captionIndex === 0}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-card-border/40 disabled:pointer-events-none disabled:opacity-30"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Prev
                    </button>
                    <span className="text-sm tabular-nums text-muted">
                      {captionIndex + 1} / {captions.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCaptionIndex((i) => i + 1)}
                      disabled={captionIndex === captions.length - 1}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-card-border/40 disabled:pointer-events-none disabled:opacity-30"
                    >
                      Next
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </article>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
