"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavLink = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function MobileNav({ navLinks }: { navLinks: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:hidden">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center justify-center rounded-lg p-2.5 transition-colors ${
              isActive
                ? "bg-foreground/10 text-foreground"
                : "text-muted hover:bg-foreground/10 hover:text-foreground"
            }`}
            aria-label={link.label}
          >
            {link.icon}
          </Link>
        );
      })}
    </nav>
  );
}
