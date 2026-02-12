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

export async function GET(request: Request) {
  const supabase = await createClient();
  const origin = getRedirectOrigin(request);
  const redirectTo = `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`);
  }

  if (data?.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(`${origin}/auth/error?message=No+redirect+URL`);
}
