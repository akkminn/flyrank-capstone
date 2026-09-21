import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
    return (
        <PageContainer>
            <p className="mb-4 text-sm text-slate-300">404</p>
            <h1 className="text-3xl font-bold tracking-tight">This page doesn&apos;t exist</h1>
            <p className="mt-4 max-w-xl text-slate-300">
                The link may be old or mistyped. Head back home, or pick a page from the menu.
            </p>
            <div className="mt-8">
                <Link href="/" className={buttonVariants({ size: "lg" })}>
                    Go home
                </Link>
            </div>
        </PageContainer>
    );
}
