"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[global-error]", error);
    }, [error]);

    return (
        <html lang="en">
            <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-white">
                <h1 className="text-xl font-semibold">Something broke</h1>
                <p className="max-w-md text-sm text-slate-400">
                    The page failed to load. Try reloading — if that keeps
                    happening, come back later.
                </p>
                <button
                    type="button"
                    onClick={() => reset()}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
                >
                    Reload
                </button>
            </body>
        </html>
    );
}
