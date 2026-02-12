import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getRedirectOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  const url = new URL(request.url);
  return url.origin;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const origin = getRedirectOrigin(request);

  await supabase.auth.signOut();

  return NextResponse.redirect(`${origin}/`);
}

