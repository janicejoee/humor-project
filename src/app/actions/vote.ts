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

  // New auditing columns are non-nullable across your schema.
  // - created_by_user_id should only be set when the row is first created.
  // - modified_by_user_id should be updated every time the row changes.
  //
  // We avoid `upsert()` here so we can preserve created_* fields on conflict.
  const { data: existingRow, error: existingError } = await supabase
    .from("caption_votes")
    .select("profile_id")
    .eq("profile_id", user.id)
    .eq("caption_id", captionId)
    .maybeSingle();

  if (existingError) {
    return { ok: false, error: existingError.message };
  }

  const { error } = existingRow
    ? await supabase
        .from("caption_votes")
        .update({
          vote_value: voteValue,
          modified_by_user_id: user.id,
        })
        .eq("profile_id", user.id)
        .eq("caption_id", captionId)
    : await supabase.from("caption_votes").insert({
        profile_id: user.id,
        caption_id: captionId,
        vote_value: voteValue,
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
      });

  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/");
  revalidatePath("/my-humor");
  return { ok: true };
}
