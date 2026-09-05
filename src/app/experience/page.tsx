import { PageContainer } from "@/components/page-container";

type Role = {
    title: string;
    org: string;
    dates: string;
    summary: string;
    bullets: string[];
};

const ROLES: Role[] = [
    {
        title: "Front-end AI Engineering Intern",
        org: "FlyRank AI",
        dates: "07/2026 – Present · Remote",
        summary:
            "Building AI-integrated, high-performance web interfaces on a front-end track focused on shipping production-quality generative-AI product experiences.",
        bullets: [
            "Capstone: architecting and deploying this portfolio site, incorporating AI-assisted development workflows end to end — environment setup, Git hygiene, and building with Claude Code.",
        ],
    },
    {
        title: "Full-Stack Developer",
        org: "Theinngu Yogi Management System",
        dates: "02/2025 – Present · Remote · still active",
        summary:
            "An internal management system for a Myanmar Buddhist meditation organization, tracking retreat participants, volunteers, regional groups, and classes. Vue 3 + TypeScript on the frontend, Spring Boot 3.3 + PostgreSQL on the backend — 814 commits authored across both.",
        bullets: [
            "Designed the PostgreSQL schema and data-access layer across ~15 entity modules, including migration flows for legacy records.",
            "Built a generic specification-based search layer used by every entity's search endpoint, instead of per-entity query code.",
            "Built a field-level data-reconciliation workflow for Excel-imported records that conflict with existing ones — per-field resolution, duplicate detection, and a reusable error-resolution UI pattern.",
            "Built the Excel import/export pipeline (Apache POI, EasyExcel, OpenCSV) with override-on-conflict logic and async email delivery.",
            "Implemented JWT authentication, role-based access control, and OTP/PIN verification flows across every module.",
            "Built reusable UI infrastructure — filter persistence, multi-column sorting, pagination, searchable comboboxes — shared across ~15 modules.",
        ],
    },
    {
        title: "Volunteer Mathematics Teacher",
        org: "Zee Kwat Academy (by Thate Pan Hub)",
        dates: "07/2021 – 02/2022 · 34 weeks",
        summary:
            "Designed and delivered mathematics projects and activities, improving student comprehension and participation.",
        bullets: [],
    },
];

export default function ExperiencePage() {
    return (
        <PageContainer>
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
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <h2 className="text-lg font-semibold text-white">
                                {role.title} — {role.org}
                            </h2>
                            <span className="text-sm text-slate-400">{role.dates}</span>
                        </div>
                        <p className="mt-2 text-slate-300">{role.summary}</p>
                        {role.bullets.length > 0 && (
                            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-400">
                                {role.bullets.map((bullet) => (
                                    <li key={bullet}>{bullet}</li>
                                ))}
                            </ul>
                        )}
                    </article>
                ))}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="text-lg font-semibold text-white">Research</h2>
                    <p className="mt-2 text-sm text-slate-300">
                        Co-researcher on a study of how generative-AI tools relate to
                        real job-search outcomes among ICT students (Rangsit
                        University, ICT 402). Built the full data-cleaning and
                        analysis pipeline in Python; ran regression, correlation, and
                        diagnostic tests. Key finding: AI resume/CV optimization was
                        the only significant predictor of self-reported outcomes —
                        frequency of AI use wasn't. It isn't how often people use AI,
                        it's what they use it for.
                    </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="text-lg font-semibold text-white">Leadership</h2>
                    <p className="mt-2 text-sm text-slate-300">
                        Team leader for a 19-member, five-team committee organizing
                        the "Generative AI and the Future of ICT Learning" symposium
                        at Rangsit University — personally secured the keynote
                        speaker and delivered a 64-attendee event with a 4.42/5
                        average satisfaction score.
                    </p>
                </article>
            </div>
        </PageContainer>
    );
}
