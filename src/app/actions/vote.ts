"use server";

import { revalidatePath } from "next/cache";
import { getCachedClient, getCachedUser } from "@/lib/supabase/server";

export type VoteValue = 1 | -1 | 0;

/**
 * Set, update, or remove the current user's vote on a caption.
 * voteValue: 1 = like (thumb up), -1 = dislike (thumb down), 0 = remove vote.
 *
 * caption_votes: one row per (profile_id, caption_id); vote_value +1 = like, -1 = dislike.
 * No row means the user has not voted.
 */
export async function voteCaption(
  captionId: string,
  voteValue: VoteValue
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCachedUser();
  if (!user) {
    return { ok: false, error: "Not signed in" };
  }

  const supabase = await getCachedClient();
  if (voteValue === 0) {
    const { error } = await supabase
      .from("caption_votes")
      .delete()
      .eq("profile_id", user.id)
      .eq("caption_id", captionId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/my-humor");
    return { ok: true };
  }

  const nowUtc = new Date().toISOString();
  const { error } = await supabase.from("caption_votes").upsert(
    {
      profile_id: user.id,
      caption_id: captionId,
      vote_value: voteValue,
      created_datetime_utc: nowUtc,
      modified_datetime_utc: nowUtc,
    },
    { onConflict: "profile_id,caption_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/");
  revalidatePath("/my-humor");
  return { ok: true };
}
