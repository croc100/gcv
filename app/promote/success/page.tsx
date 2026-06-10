"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0d1117" }}>
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#238636] flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-[#e6edf3] mb-2">Payment confirmed!</h1>
        <p className="text-sm text-[#7d8590] leading-relaxed mb-6">
          Your repo will appear in the Sponsored section on GCV within a few minutes.
          You&apos;ll receive a confirmation email shortly.
        </p>

        {sessionId && (
          <p className="text-[10px] text-[#484f58] mb-6 font-mono">
            Ref: {sessionId.slice(0, 24)}…
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Link
            href="/trending"
            className="px-4 py-2 text-sm rounded-lg border border-[#30363d] text-[#7d8590] hover:border-[#388bfd] hover:text-[#e6edf3] transition-colors"
          >
            View Trending
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-sm rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
