"use client";

import { useEffect, useMemo, useState } from "react";

interface OnboardingTutorialModalProps {
  userId: string | null;
  userCreatedAt?: string | null;
}

const NEW_USER_WINDOW_MS = 24 * 60 * 60 * 1000;

function isNewUser(createdAt?: string | null): boolean {
  if (!createdAt) return false;
  const createdAtMs = Date.parse(createdAt);
  if (!Number.isFinite(createdAtMs)) return false;
  return Date.now() - createdAtMs <= NEW_USER_WINDOW_MS;
}

export function OnboardingTutorialModal({
  userId,
  userCreatedAt,
}: OnboardingTutorialModalProps) {
  const [open, setOpen] = useState(false);

  const storageKey = useMemo(
    () => (userId ? `tutorial_seen_${userId}` : null),
    [userId]
  );

  useEffect(() => {
    if (!storageKey || !isNewUser(userCreatedAt)) return;

    const hasSeenTutorial = window.localStorage.getItem(storageKey) === "1";
    if (!hasSeenTutorial) {
      setOpen(true);
    }
  }, [storageKey, userCreatedAt]);

  const closeModal = () => {
    if (storageKey) {
      window.localStorage.setItem(storageKey, "1");
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-card-border bg-card p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Welcome to CrackdTagram
            </h2>
            <p className="mt-1 text-sm text-muted">
              Quick tour to help you navigate the app.
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-md p-1.5 text-muted transition hover:bg-muted hover:text-foreground"
            aria-label="Close tutorial"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-foreground">
          <div className="rounded-lg border border-card-border bg-background p-3">
            <p className="font-medium">1. Home</p>
            <p className="mt-1 text-muted">Browse images ranked by top liked captions, then vote on captions.</p>
          </div>
          <div className="rounded-lg border border-card-border bg-background p-3">
            <p className="font-medium">2. Generate</p>
            <p className="mt-1 text-muted">Upload your own image and generate multiple funny caption options.</p>
          </div>
          <div className="rounded-lg border border-card-border bg-background p-3">
            <p className="font-medium">3. My Humor</p>
            <p className="mt-1 text-muted">Review your uploads plus captions you liked or disliked.</p>
          </div>
          <div className="rounded-lg border border-card-border bg-background p-3">
            <p className="font-medium">Tip</p>
            <p className="mt-1 text-muted">Use the top navigation to switch between sections anytime.</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
