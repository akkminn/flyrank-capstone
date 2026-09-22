import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
    Briefcase01Icon,
    Calendar01Icon,
    FlaskConicalIcon,
    Location01Icon,
    TeacherIcon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { PageContainer } from "@/components/page-container";

type Role = {
    title: string;
    org: string;
    dates: string;
    location?: string;
    active?: boolean;
    icon: IconSvgElement;
    summary: string;
    bullets: string[];
    stack?: string[];
};

const ROLES: Role[] = [
    {
        title: "Front-end AI Engineering Intern",
        org: "FlyRank AI",
        dates: "07/2026 – Present",
        location: "Remote",
        active: true,
        icon: Briefcase01Icon,
        summary:
            "Building AI-integrated, high-performance web interfaces on a front-end track focused on shipping production-quality generative-AI product experiences.",
        bullets: [
            "Capstone: architecting and deploying this portfolio site, incorporating AI-assisted development workflows end to end — environment setup, Git hygiene, and building with Claude Code.",
        ],
        stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    },
    {
        title: "Full-Stack Developer",
        org: "Theinngu Yogi Management System",
        dates: "02/2025 – Present",
        location: "Remote",
        active: true,
        icon: Briefcase01Icon,
        summary:
            "An internal management system for a Myanmar Buddhist meditation organization, tracking retreat participants, volunteers, regional groups, and classes — 814 commits authored across the frontend and backend.",
        bullets: [
            "Designed the PostgreSQL schema and data-access layer across ~15 entity modules, including migration flows for legacy records.",
            "Built a generic specification-based search layer used by every entity's search endpoint, instead of per-entity query code.",
            "Built a field-level data-reconciliation workflow for Excel-imported records that conflict with existing ones — per-field resolution, duplicate detection, and a reusable error-resolution UI pattern.",
            "Built the Excel import/export pipeline (Apache POI, EasyExcel, OpenCSV) with override-on-conflict logic and async email delivery.",
            "Implemented JWT authentication, role-based access control, and OTP/PIN verification flows across every module.",
            "Built reusable UI infrastructure — filter persistence, multi-column sorting, pagination, searchable comboboxes — shared across ~15 modules.",
        ],
        stack: ["Java 21", "Vue 3", "TypeScript", "Spring Boot 3.3", "PostgreSQL"],
    },
    {
        title: "Volunteer Mathematics Teacher",
        org: "Zee Kwat Academy (by Thate Pan Hub)",
        dates: "07/2021 – 02/2022 (34 weeks)",
        icon: TeacherIcon,
        summary:
            "Designed and delivered mathematics projects and activities over 34 weeks, improving student comprehension and participation.",
        bullets: [],
    },
];

export default function ExperiencePage() {
    return (
        <PageContainer>
            <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-400">
                <HugeiconsIcon icon={Briefcase01Icon} size={14} aria-hidden="true" />
                Where I&apos;ve worked
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Professional work, plus the research and leadership alongside it.
            </p>

            <div className="mt-10 space-y-6">
                {ROLES.map((role) => (
                    <article
                        key={role.title + role.org}
                        className="rounded-2xl border border-white/10 bg-white/5 p-6"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                                    <HugeiconsIcon icon={role.icon} size={16} aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <h2 className="text-lg font-semibold text-white">{role.title}</h2>
                                        {role.active && (
                                            <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                                                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-mono text-xs text-slate-400">{role.org}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-start gap-1.5 font-mono text-xs text-slate-400 sm:items-end">
                                <span className="flex items-center gap-1.5">
                                    <HugeiconsIcon icon={Calendar01Icon} size={12} aria-hidden="true" />
                                    {role.dates}
                                </span>
                                {role.location && (
                                    <span className="flex items-center gap-1.5">
                                        <HugeiconsIcon icon={Location01Icon} size={12} aria-hidden="true" />
                                        {role.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="mt-4 text-slate-300">{role.summary}</p>

                        {role.bullets.length > 0 && (
                            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-400">
                                {role.bullets.map((bullet) => (
                                    <li key={bullet}>{bullet}</li>
                                ))}
                            </ul>
                        )}

                        {role.stack && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {role.stack.map((tech) => (
                                    <span
                                        key={tech}
                                        className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-slate-400"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}
                    </article>
                ))}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-400">
                        <HugeiconsIcon icon={FlaskConicalIcon} size={14} aria-hidden="true" />
                        Research
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        Generative AI &amp; job-search outcomes
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                        Co-researcher on a study of how generative-AI tools relate to
                        real job-search outcomes among ICT students (Rangsit University).
                        Built the full data-cleaning and analysis pipeline in Python;
                        ran regression, correlation, and diagnostic tests.
                    </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-400">
                        <HugeiconsIcon icon={UserGroupIcon} size={14} aria-hidden="true" />
                        Leadership
                    </div>
                    <h2 className="text-lg font-semibold text-white">
                        AI symposium committee lead
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                        Team leader for a 19-member, five-team committee organizing
                        the &ldquo;Generative AI and the Future of ICT Learning&rdquo;
                        symposium at Rangsit International College — personally secured the
                        keynote speaker and delivered a 64-attendee event.
                    </p>
                </article>
            </div>
        </PageContainer>
    );
}
