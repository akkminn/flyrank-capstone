import { PageContainer } from "@/components/page-container";

export default function StudyBuddyPage() {
    return (
        <PageContainer>
            <h1 className="text-3xl font-bold tracking-tight">StudyBuddy</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                An AI-powered learning platform that turns uploaded class notes into
                gamified, Duolingo-style quizzes and smart flashcards.
            </p>

            <div className="mt-8 flex flex-wrap gap-1.5">
                {["React", "TypeScript", "Firebase", "Google Gemini API", "Tailwind CSS", "Framer Motion"].map(
                    (tech) => (
                        <span
                            key={tech}
                            className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400"
                        >
                            {tech}
                        </span>
                    )
                )}
            </div>

            <ul className="mt-6 max-w-2xl list-disc space-y-2 pl-5 text-slate-300">
                <li>
                    Integrated the Gemini API to auto-generate quizzes and flashcards
                    from uploaded PDF, DOCX, and TXT documents, with prompts and
                    validation steps engineered specifically to minimize
                    hallucination risk.
                </li>
                <li>Built a gamification system — lives, streaks, and progress tracking.</li>
                <li>Offloaded document parsing to a Web Worker for a non-blocking UI.</li>
            </ul>

            <div className="mt-8 flex gap-4 text-sm font-medium">
                <a
                    href="https://studybuddy-eight-red.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline underline-offset-2 hover:text-slate-300"
                >
                    Live demo →
                </a>
                <a
                    href="https://github.com/akkminn/studybuddy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 underline underline-offset-2 hover:text-white"
                >
                    Source on GitHub →
                </a>
            </div>
        </PageContainer>
    );
}
