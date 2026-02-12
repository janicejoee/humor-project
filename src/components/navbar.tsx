import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
];

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-card-border bg-card/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity"
          >
            Humor Project
          </Link>
          {user && (
            <nav className="hidden sm:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-muted">Signed in as</p>
              <p className="text-sm font-medium text-foreground">
                {user.email ?? user.user_metadata?.email ?? "Unknown"}
              </p>
            </div>
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center rounded-lg border border-card-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background"
              >
                Log out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

