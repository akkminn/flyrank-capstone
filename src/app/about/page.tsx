import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon, HeartIcon, SourceCodeIcon, User03Icon } from "@hugeicons/core-free-icons";

import { PageContainer } from "@/components/page-container";

const LANGUAGES = ["Burmese (native)", "English (fluent)", "Mandarin (learning)"];
const INTERESTS = ["Coding", "Teaching", "Chess", "UI/UX design"];

export default function AboutPage() {
    return (
        <PageContainer>
            <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-400">
                <HugeiconsIcon icon={User03Icon} size={14} aria-hidden="true" />
                The short version
            </div>
            <h1 className="text-3xl font-bold tracking-tight">About</h1>

            <p className="mt-4 max-w-4xl text-lg text-slate-300">
                I'm a software developer based in Bangkok, studying B.Sc. Information
                and Communication Technology at Rangsit University (CGPA 3.98/4.00).
                I'm currently a Front-end AI Engineering Intern at FlyRank, building
                AI-integrated web interfaces.
            </p>

            <div className="mt-10 space-y-6">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-400">
                        <HugeiconsIcon icon={SourceCodeIcon} size={14} aria-hidden="true" />
                        How I work
                    </div>
                    <p className="text-slate-300">
                        Most of my time goes into a production system for a Myanmar
                        Buddhist meditation organization — a Vue 3 + Spring Boot
                        internal management platform I've contributed over 800 commits
                        to since February 2025, across both the frontend and backend.
                        Alongside that, I build smaller AI-powered tools on my own:
                        a study platform that turns notes into quizzes, and a daily
                        restaurant-menu bot for students near campus.
                    </p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-400">
                        <HugeiconsIcon icon={Award01Icon} size={14} aria-hidden="true" />
                        Research &amp; leadership
                    </div>
                    <p className="text-slate-300">
                        I co-authored a research paper on how generative-AI tools
                        relate to real job-search outcomes for ICT students — the
                        headline finding was that it's not how often people use AI
                        that predicts outcomes, but what they use it for. I also led
                        a 19-person committee organizing a 64-attendee AI symposium at
                        Rangsit University, and previously spent 34 weeks volunteering
                        as a mathematics teacher.
                    </p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-400">
                        <HugeiconsIcon icon={HeartIcon} size={14} aria-hidden="true" />
                        Beyond code
                    </div>
                    <p className="text-slate-300">
                        Outside of work, I enjoy chess, UI/UX design, and teaching
                        technical material to people who aren't specialists in it.
                    </p>

                    <dl className="mt-5 grid gap-x-8 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                        <div>
                            <dt className="font-mono text-xs text-slate-400">Languages</dt>
                            <dd className="mt-2 flex flex-wrap gap-1.5">
                                {LANGUAGES.map((language) => (
                                    <span
                                        key={language}
                                        className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-slate-400"
                                    >
                                        {language}
                                    </span>
                                ))}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-mono text-xs text-slate-400">Interests</dt>
                            <dd className="mt-2 flex flex-wrap gap-1.5">
                                {INTERESTS.map((interest) => (
                                    <span
                                        key={interest}
                                        className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-slate-400"
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </dd>
                        </div>
                    </dl>
                </article>
            </div>
        </PageContainer>
    );
}
