"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type AuthState = {
  configured: boolean;
  user: { login: string; avatar: string } | null;
};

export default function NavBar() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(setAuth)
      .catch(() => setAuth({ configured: false, user: null }));
  }, []);

  const loginUrl = `/api/auth/login?returnTo=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-30 border-b border-[#21262d] bg-[#0d1117]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-11 flex items-center justify-between gap-4">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-1.5 text-[#e6edf3] hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span className="text-sm font-semibold">GCV</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/compare"
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                pathname === "/compare"
                  ? "text-[#e6edf3] bg-[#21262d]"
                  : "text-[#7d8590] hover:text-[#e6edf3]"
              }`}
            >
              Compare
            </Link>
            <Link
              href="/org/vercel"
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                pathname.startsWith("/org/")
                  ? "text-[#e6edf3] bg-[#21262d]"
                  : "text-[#7d8590] hover:text-[#e6edf3]"
              }`}
            >
              Orgs
            </Link>
          </nav>
        </div>

        {/* Right: auth */}
        <div className="flex items-center gap-2">
          {auth === null ? (
            <div className="w-6 h-6 rounded-full bg-[#21262d] animate-pulse" />
          ) : auth.user ? (
            <div className="flex items-center gap-2">
              <Image
                src={auth.user.avatar}
                alt={auth.user.login}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-xs text-[#7d8590] hidden sm:block">{auth.user.login}</span>
              <a
                href="/api/auth/logout"
                className="text-xs text-[#7d8590] hover:text-[#e6edf3] transition-colors px-2 py-1 rounded-md hover:bg-[#21262d]"
              >
                Sign out
              </a>
            </div>
          ) : auth.configured ? (
            <a
              href={loginUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Sign in with GitHub
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
