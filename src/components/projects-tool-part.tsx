import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Alert01Icon,
    ArrowRight02Icon,
    FolderSearchIcon,
    Loading03Icon,
} from "@hugeicons/core-free-icons";

import type { Project } from "@/lib/ai/projects-data";
import type { PortfolioUIMessage } from "@/lib/ai/tools";
import { cn } from "@/lib/utils";

type ProjectsToolUIPart = Extract<
    PortfolioUIMessage["parts"][number],
    { type: "tool-getProjects" }
>;

// Renders the full lifecycle of the `getProjects` tool call as four visually
// distinct states, per FE-07's requirement — never a raw JSON dump.
export function ProjectsToolPart({ part }: { part: ProjectsToolUIPart }) {
    switch (part.state) {
        case "input-streaming":
            return (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-500" />
                    Preparing to look up projects…
                </div>
            );

        case "input-available":
            return (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-300">
                    <HugeiconsIcon
                        icon={Loading03Icon}
                        size={16}
                        className="shrink-0 animate-spin text-slate-400"
                    />
                    {part.input?.name
                        ? `Looking up "${part.input.name}"…`
                        : "Looking up Minn's projects…"}
                </div>
            );

        case "output-available":
            return part.output.projects.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {part.output.projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-3 text-sm text-slate-400">
                    <HugeiconsIcon icon={FolderSearchIcon} size={16} className="shrink-0" />
                    No matching projects found.
                </div>
            );

        case "output-error":
            return (
                <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3"
                >
                    <HugeiconsIcon
                        icon={Alert01Icon}
                        size={18}
                        className="mt-0.5 shrink-0 text-red-300"
                    />
                    <p className="text-sm leading-relaxed text-red-200">{part.errorText}</p>
                </div>
            );

        default:
            return null;
    }
}

function ProjectCard({ project }: { project: Project }) {
    return (
        <Link
            href={project.href}
            className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-3 transition-colors hover:border-white/20 hover:bg-slate-800"
        >
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{project.name}</span>
                <span
                    className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                        project.status === "live"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-amber-500/15 text-amber-300"
                    )}
                >
                    {project.status}
                </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">{project.summary}</p>

            <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                    <span
                        key={tech}
                        className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400"
                    >
                        {tech}
                    </span>
                ))}
            </div>

            <span className="flex items-center gap-1 text-xs font-medium text-slate-300 group-hover:text-white">
                View project
                <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
            </span>
        </Link>
    );
}
