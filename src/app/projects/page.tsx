import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, GithubIcon, Layers01Icon } from "@hugeicons/core-free-icons";

import { PageContainer } from "@/components/page-container";
import { PROJECTS } from "@/lib/ai/projects-data";

export default function ProjectsPage() {
    return (
        <PageContainer>
            <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-400">
                <HugeiconsIcon icon={Layers01Icon} size={14} aria-hidden="true" />
                Selected work
            </div>
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
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                            <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                                <span
                                    className={
                                        project.status === "live"
                                            ? "size-1.5 rounded-full bg-emerald-400"
                                            : "size-1.5 rounded-full bg-slate-500"
                                    }
                                    aria-hidden="true"
                                />
                                {project.status === "live" ? "Live" : "Concept"}
                            </span>
                        </div>

                        <p className="text-sm text-slate-300">{project.summary}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {project.stack.map((tech) => (
                                <span
                                    key={tech}
                                    className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-slate-400"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-3">
                            {project.href === "/projects" ? (
                                <p className="text-sm text-slate-400">
                                    Try it — the &ldquo;Ask about me&rdquo; button in the
                                    corner of every page.
                                </p>
                            ) : (
                                <Link
                                    href={project.href}
                                    className="text-sm font-medium text-slate-300 hover:text-white"
                                >
                                    View project →
                                </Link>
                            )}

                            {(project.githubHref || project.liveHref) && (
                                <div className="flex items-center gap-1.5">
                                    {project.githubHref && (
                                        <a
                                            href={project.githubHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`${project.name} on GitHub`}
                                            aria-label={`${project.name} on GitHub`}
                                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-white"
                                        >
                                            <HugeiconsIcon icon={GithubIcon} size={14} aria-hidden="true" />
                                        </a>
                                    )}
                                    {project.liveHref && (
                                        <a
                                            href={project.liveHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`${project.name} live demo`}
                                            aria-label={`${project.name} live demo`}
                                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-white"
                                        >
                                            <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} aria-hidden="true" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </PageContainer>
    );
}
