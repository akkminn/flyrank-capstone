import Link from "next/link";

import { HeroBackdrop } from "@/components/hero/hero-backdrop";
import { OpenTerminalButton } from "@/components/open-terminal-button";
import { PageContainer } from "@/components/page-container";
import { buttonVariants } from "@/components/ui/button";

const FACTS = [
    { label: "Based in", value: "Bangkok, Thailand" },
    { label: "Now", value: "Front-end AI Engineering Intern, FlyRank AI" },
    { label: "Studying", value: "ICT, Rangsit University" },
];

export default function HomePage() {
    return (
        <HeroBackdrop>
            <PageContainer className="flex w-full flex-1 flex-col justify-center py-16">
                <p className="mb-6 font-mono text-sm text-emerald-300">Developer Portfolio</p>

                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                        Aung Ko Ko Minn
                    </h1>
                    <span className="font-mono text-xl text-slate-300 sm:text-2xl lg:text-3xl">
                        (Minn)
                    </span>
                </div>

                <p className="mt-5 max-w-3xl text-xl font-light text-slate-300 sm:text-2xl">
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
                    <OpenTerminalButton />
                </div>

                <dl className="mt-10 grid max-w-3xl gap-x-8 gap-y-4 border-t border-white/10 pt-6 sm:grid-cols-3">
                    {FACTS.map((fact) => (
                        <div key={fact.label}>
                            <dt className="font-mono text-xs text-slate-300">{fact.label}</dt>
                            <dd className="mt-1 text-sm text-white">{fact.value}</dd>
                        </div>
                    ))}
                </dl>
            </PageContainer>
        </HeroBackdrop>
    );
}
