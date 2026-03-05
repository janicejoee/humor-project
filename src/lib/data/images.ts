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

export type CaptionSort =
  | "like_desc"
  | "like_asc"
  | "date_newest"
  | "date_oldest";

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

export type FetchAllCaptionsOptions = {
  /** Max number of images to fetch from DB (default 50). */
  imageLimit?: number;
  /** Skip this many images (for pagination). */
  imageOffset?: number;
  /** Max number of caption cards to return (default 30). */
  itemsLimit?: number;
  /** Skip this many items after sort (for page 2, etc.). */
  itemsOffset?: number;
  /** Sort order for caption cards (default "like_desc"). */
  sort?: CaptionSort;
};

const DEFAULT_IMAGE_LIMIT = 50;
const DEFAULT_IMAGE_OFFSET = 0;
const DEFAULT_ITEMS_LIMIT = 30;
const DEFAULT_ITEMS_OFFSET = 0;
const DEFAULT_SORT: CaptionSort = "like_desc";

/**
 * Fetches captions for public images (one card per caption), sorted by like_count desc.
 * When profileId is provided, includes userHasVoted (like) and userHasDisliked from caption_votes.
 * Supports imageLimit/imageOffset and itemsLimit/itemsOffset for smaller payloads and pagination.
 */
export async function fetchAllCaptionsWithImages(
  supabaseClient: SupabaseClient,
  profileId?: string | null,
  options?: FetchAllCaptionsOptions
): Promise<FetchImagesResult> {
  try {
    const imageLimit = options?.imageLimit;
    const imageOffset = options?.imageOffset ?? DEFAULT_IMAGE_OFFSET;
    const itemsLimit = options?.itemsLimit ?? DEFAULT_ITEMS_LIMIT;
    const itemsOffset = options?.itemsOffset ?? DEFAULT_ITEMS_OFFSET;
    const sort: CaptionSort = options?.sort ?? DEFAULT_SORT;

    let imagesQuery = supabaseClient
      .from("images")
      .select("id, url, image_description, is_public, captions(*)")
      .eq("is_public", true);
    
    // Only apply range if imageLimit is specified (for pagination by images)
    if (imageLimit != null) {
      imagesQuery = imagesQuery.range(imageOffset, imageOffset + imageLimit - 1);
    }

    const imagesPromise = imagesQuery;

    const votesPromise =
      profileId != null
        ? supabaseClient
            .from("caption_votes")
            .select("caption_id, vote_value")
            .eq("profile_id", profileId)
        : null;

    const [imagesResult, votesResult] = await Promise.all([
      imagesPromise,
      votesPromise ?? Promise.resolve({ data: null, error: null }),
    ]);

    const { data, error } = imagesResult;
    if (error) {
      return { ok: false, error: error.message };
    }

    const rows = (data ?? []) as ImageRow[];
    const items: ImageWithTopCaption[] = [];

    for (const row of rows) {
      const captions = row.captions ?? [];
      for (const cap of captions) {
        items.push({
          image: row,
          topCaption: cap,
          userHasVoted: false,
          userHasDisliked: false,
        });
      }
    }

    items.sort((a, b) => {
      const aLikes = Number(a.topCaption.like_count) ?? 0;
      const bLikes = Number(b.topCaption.like_count) ?? 0;
      const aImageId = String(a.image.id);
      const bImageId = String(b.image.id);

      switch (sort) {
        case "like_asc":
          if (aLikes !== bLikes) return aLikes - bLikes;
          return aImageId.localeCompare(bImageId);
        case "date_newest":
          return bImageId.localeCompare(aImageId);
        case "date_oldest":
          return aImageId.localeCompare(bImageId);
        case "like_desc":
        default:
          if (bLikes !== aLikes) return bLikes - aLikes;
          return aImageId.localeCompare(bImageId);
      }
    });

    if (profileId && !votesResult?.error && votesResult?.data?.length) {
      const votes = votesResult.data as { caption_id: string; vote_value: number }[];
      const likedCaptionIds = new Set(
        votes.filter((r) => Number(r.vote_value) > 0).map((r) => r.caption_id)
      );
      const dislikedCaptionIds = new Set(
        votes.filter((r) => Number(r.vote_value) < 0).map((r) => r.caption_id)
      );
      for (const item of items) {
        item.userHasVoted = likedCaptionIds.has(item.topCaption.id);
        item.userHasDisliked = dislikedCaptionIds.has(item.topCaption.id);
      }
    }

    const sliced = items.slice(itemsOffset, itemsOffset + itemsLimit);
    return { ok: true, items: sliced };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}

export type FetchUploadedImagesResult =
  | { ok: true; items: ImageRow[] }
  | { ok: false; error: string };

export async function fetchUserUploadedImages(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<FetchUploadedImagesResult> {
  try {
    const { data, error } = await supabaseClient
      .from("images")
      .select("id, url, image_description, is_public, captions(*)")
      .eq("profile_id", userId)
      .order("id", { ascending: false });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, items: (data ?? []) as ImageRow[] };
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

export async function fetchDislikedImagesWithCaptions(
  supabaseClient: SupabaseClient,
  profileId: string
): Promise<FetchImagesResult> {
  try {
    const { data: votesData, error: votesError } = await supabaseClient
      .from("caption_votes")
      .select("caption_id")
      .eq("profile_id", profileId)
      .lt("vote_value", 0);

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
