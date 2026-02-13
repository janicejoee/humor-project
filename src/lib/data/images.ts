import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { CaptionRow, ImageRow, ImageWithTopCaption } from "@/lib/data/types";

function getTopCaption(
  captions: CaptionRow[] | null | undefined
): CaptionRow | null {
  const list = captions ?? [];
  if (list.length === 0) return null;
  return [...list].sort((a, b) => {
    const aLikes = Number(a.like_count) ?? 0;
    const bLikes = Number(b.like_count) ?? 0;
    if (bLikes !== aLikes) return bLikes - aLikes;
    return String(a.id).localeCompare(String(b.id));
  })[0] ?? null;
}

export type FetchImagesResult =
  | { ok: true; items: ImageWithTopCaption[] }
  | { ok: false; error: string };

export async function fetchImagesWithTopCaptions(): Promise<FetchImagesResult> {
  try {
    const { data, error } = await supabase
      .from("images")
      .select("id, url, image_description, is_public, captions(*)")
      .eq("is_public", true);

    if (error) {
      return { ok: false, error: error.message };
    }

    const rows = (data ?? []) as ImageRow[];
    const items: ImageWithTopCaption[] = [];

    for (const row of rows) {
      const topCaption = getTopCaption(row.captions);
      if (topCaption) {
        items.push({ image: row, topCaption });
      }
    }

    items.sort((a, b) => {
      const aLikes = Number(a.topCaption.like_count) ?? 0;
      const bLikes = Number(b.topCaption.like_count) ?? 0;
      if (bLikes !== aLikes) return bLikes - aLikes;
      return String(a.image.id).localeCompare(String(b.image.id));
    });

    return { ok: true, items };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}

/**
 * Fetches all captions for public images (one card per caption), sorted by like_count desc.
 * When profileId is provided, includes userHasVoted from caption_votes so the heart can show red.
 */
export async function fetchAllCaptionsWithImages(
  supabaseClient: SupabaseClient,
  profileId?: string | null
): Promise<FetchImagesResult> {
  try {
    const { data, error } = await supabaseClient
      .from("images")
      .select("id, url, image_description, is_public, captions(*)")
      .eq("is_public", true);

    if (error) {
      return { ok: false, error: error.message };
    }

    const rows = (data ?? []) as ImageRow[];
    const items: ImageWithTopCaption[] = [];

    for (const row of rows) {
      const captions = row.captions ?? [];
      for (const cap of captions) {
        items.push({ image: row, topCaption: cap, userHasVoted: false });
      }
    }

    items.sort((a, b) => {
      const aLikes = Number(a.topCaption.like_count) ?? 0;
      const bLikes = Number(b.topCaption.like_count) ?? 0;
      if (bLikes !== aLikes) return bLikes - aLikes;
      return String(a.topCaption.id).localeCompare(String(b.topCaption.id));
    });

    if (profileId) {
      const { data: votesData, error: votesError } = await supabaseClient
        .from("caption_votes")
        .select("caption_id")
        .eq("profile_id", profileId)
        .gt("vote_value", 0);

      if (!votesError && votesData?.length) {
        const likedCaptionIds = new Set(
          (votesData as { caption_id: string }[]).map((r) => r.caption_id)
        );
        for (const item of items) {
          item.userHasVoted = likedCaptionIds.has(item.topCaption.id);
        }
      }
    }

    return { ok: true, items };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}

/** Caption row as returned with nested image from captions table (relation name may be "image" or "images"; can be array or single). */
type CaptionWithImage = CaptionRow & {
  image?: ImageRow | ImageRow[] | null;
  images?: ImageRow | ImageRow[] | null;
};

export async function fetchLikedImagesWithCaptions(
  supabaseClient: SupabaseClient,
  profileId: string
): Promise<FetchImagesResult> {
  try {
    const { data: votesData, error: votesError } = await supabaseClient
      .from("caption_votes")
      .select("caption_id")
      .eq("profile_id", profileId)
      .gt("vote_value", 0);

    if (votesError) {
      return { ok: false, error: votesError.message };
    }

    const captionIds = (votesData ?? [])
      .map((r) => (r as { caption_id: string }).caption_id)
      .filter(Boolean);

    if (captionIds.length === 0) {
      return { ok: true, items: [] };
    }

    const { data: captionsData, error: captionsError } = await supabaseClient
      .from("captions")
      .select("id, content, like_count, is_public, images(id, url, image_description, is_public)")
      .in("id", captionIds);

    if (captionsError) {
      return { ok: false, error: captionsError.message };
    }

    const rows = (captionsData ?? []) as CaptionWithImage[];
    const items: ImageWithTopCaption[] = [];

    for (const row of rows) {
      const rawImage = row.image ?? row.images ?? null;
      const image = Array.isArray(rawImage) ? rawImage[0] ?? null : rawImage;
      if (!image) continue;
      const imageRow: ImageRow = {
        id: image.id,
        url: image.url ?? null,
        image_description: image.image_description ?? null,
        is_public: image.is_public ?? null,
        captions: null,
      };
      const topCaption: CaptionRow = {
        id: row.id,
        content: row.content ?? null,
        like_count: Number(row.like_count) ?? 0,
        is_public: row.is_public ?? false,
      };
      items.push({ image: imageRow, topCaption });
    }

    return { ok: true, items };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}
