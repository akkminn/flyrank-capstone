"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon } from "@hugeicons/core-free-icons";

import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[route-error]", error);
    }, [error]);

    return (
        <PageContainer>
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-8">
                <HugeiconsIcon icon={Alert01Icon} size={28} className="text-red-300" />
                <div>
                    <h1 className="text-xl font-semibold text-white">
                        Something broke on this page
                    </h1>
                    <p className="mt-2 max-w-md text-sm text-red-200">
                        That&apos;s on us, not you. Try again, or head back to the
                        homepage.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button size="sm" onClick={() => reset()}>
                        Try again
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        nativeButton={false}
                        render={<a href="/" />}
                    >
                        Go home
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
}
