import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { PROJECTS } from "@/lib/ai/projects-data";

export default function ProjectsPage() {
    return (
        <PageContainer>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Personal and university projects. (Theinngu, the largest system I've
                built, is professional work — see{" "}
                <Link href="/experience" className="underline underline-offset-2 hover:text-white">
                    Experience
                </Link>
                .)
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {PROJECTS.map((project) => (
                    <article
                        key={project.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6"
                    >
                        <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                        <p className="text-sm text-slate-300">{project.summary}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {project.stack.map((tech) => (
                                <span
                                    key={tech}
                                    className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs text-slate-400"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                        {project.href === "/projects" ? (
                            <p className="mt-1 text-sm text-slate-400">
                                Try it — the &ldquo;Ask about me&rdquo; button in the corner
                                of every page.
                            </p>
                        ) : (
                            <Link
                                href={project.href}
                                className="mt-1 text-sm font-medium text-slate-300 hover:text-white"
                            >
                                View project →
                            </Link>
                        )}
                    </article>
                ))}
            </div>
        </PageContainer>
    );
}
