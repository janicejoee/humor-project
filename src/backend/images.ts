import { supabase } from "@/lib/supabase/client";
import type { CaptionRow, ImageRow, ImageWithTopCaption } from "./types";

export const PAGE_SIZE = 12;

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
  })[0];
}

export type FetchImagesResult =
  | { ok: true; items: ImageWithTopCaption[] }
  | { ok: false; error: string };

export async function fetchImagesWithTopCaptions(): Promise<FetchImagesResult> {
  const { data: images, error } = await supabase
    .from("images")
    .select(
      "id, url, image_description, is_public, captions(id, content, like_count, is_public)"
    )
    .eq("is_public", true)
    .order("created_datetime_utc", { ascending: false });

  if (error) return { ok: false, error: error.message };

  const allItems: ImageWithTopCaption[] = [];
  for (const row of images ?? []) {
    const image = row as ImageRow;
    const topCaption = getTopCaption(image.captions);
    if (topCaption) allItems.push({ image, topCaption });
  }

  allItems.sort(
    (a, b) =>
      Number(b.topCaption.like_count) - Number(a.topCaption.like_count)
  );

  return { ok: true, items: allItems };
}
