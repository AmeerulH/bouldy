"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
    ),
  },
  {
    href: "/explore",
    label: "Explore",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5z" />
      </>
    ),
  },
  {
    href: "/sessions",
    label: "Sessions",
    icon: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M8 3v4m8-4v4M4 10h16" />
      </>
    ),
  },
  {
    href: "/gyms",
    label: "Gyms",
    icon: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
  {
    href: "/profile",
    label: "You",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.6 3.8-5.5 7-5.5s6.2 1.9 7 5.5" />
      </>
    ),
  },
];

/** Full-screen form pages own the bottom edge with their sticky Save bar. */
const FORM_PATH = /\/routes\/new$|\/routes\/[^/]+\/edit$/;

export function BottomNav() {
  const pathname = usePathname();
  if (FORM_PATH.test(pathname)) return null;

  return (
    <nav
      aria-label="Primary"
      className="flex items-stretch justify-around border-t border-hairline bg-bg pb-[max(8px,env(safe-area-inset-bottom))] pt-2"
    >
      {TABS.map((tab) => {
        const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href) || (tab.href === "/sessions" && pathname === "/climbs");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className="bottom-tab flex min-w-0 flex-1 flex-col items-center gap-1 py-1.5"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isActive ? "text-accent" : "text-ink-faint"}
              aria-hidden="true"
            >
              {tab.icon}
            </svg>
            <span
              className={`text-[11px] font-medium ${
                isActive ? "text-accent" : "text-ink-faint"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
