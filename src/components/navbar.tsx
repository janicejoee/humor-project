import Link from "next/link";
import { getCachedUser } from "@/lib/supabase/server";
import { MobileNav, type NavLink } from "./mobile-nav";
import { NavLinks } from "./nav-links";

const navLinks = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/my-humor",
    label: "My Humor",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export async function Navbar() {
  const user = await getCachedUser();

  return (
    <header className="border-b border-card-border bg-card/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-start gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity sm:text-sm"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-red-100 dark:from-green-900/30 dark:to-red-900/30 sm:h-8 sm:w-8">
            <svg className="h-4 w-4 text-foreground sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>CrackdTagram</span>
        </Link>
        {user && (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center gap-4">
              <NavLinks links={navLinks} />
            </nav>
            {/* Mobile Navigation */}
            <div className="sm:hidden">
              <MobileNav navLinks={navLinks} />
            </div>
          </>
        )}
        {user && (
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden md:block text-left">
              <p className="text-xs text-muted">Signed in as</p>
              <p className="text-sm font-medium text-foreground truncate max-w-[120px] lg:max-w-none">
                {user.email ?? user.user_metadata?.email ?? "Unknown"}
              </p>
            </div>
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center rounded-lg border border-card-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all hover:bg-foreground hover:text-background active:scale-95 sm:px-3"
              >
                <span className="hidden sm:inline">Log out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

