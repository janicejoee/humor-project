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
