"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "./mobile-nav";

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 text-sm transition-colors ${
              isActive
                ? "text-foreground font-medium"
                : "text-muted hover:text-foreground"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
