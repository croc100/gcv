"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: "#0d1117" }}>
      <p className="text-sm font-mono text-[#f85149] bg-[#da363311] border border-[#da3633] rounded-lg px-4 py-3 max-w-xl break-all">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm bg-[#21262d] border border-[#30363d] text-[#e6edf3] rounded-lg hover:border-[#58a6ff] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
