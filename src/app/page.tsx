import Link from "next/link";

import { HeroBackdrop } from "@/components/hero/hero-backdrop";
import { TECH } from "@/components/hero/hero-config";
import { PageContainer } from "@/components/page-container";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
    return (
        <HeroBackdrop>
            <PageContainer className="flex w-full flex-1 flex-col justify-center py-16">
                <p className="mb-4 text-sm text-slate-400">Developer Portfolio</p>

                <h1 className="text-4xl font-bold tracking-tight">
                    Aung Ko Ko Minn
                </h1>

                <p className="mt-4 max-w-2xl text-lg text-slate-300">
                    Software developer building maintainable frontend and full-stack
                    applications.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/projects" className={buttonVariants({ size: "lg" })}>
                        View projects
                    </Link>
                    <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline" })}>
                        Get in touch
                    </Link>
                </div>

                <ul
                    aria-label="Tech stack"
                    className="mt-10 flex max-w-xl flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400"
                >
                    {TECH.map((tech) => (
                        <li key={tech.id}>{tech.name}</li>
                    ))}
                </ul>
            </PageContainer>
        </HeroBackdrop>
    );
}
