import { PageContainer } from "@/components/page-container";

export default function MenuCheckerPage() {
    return (
        <PageContainer>
            <h1 className="text-3xl font-bold tracking-tight">MenuChecker</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
                A daily restaurant-menu digest for Myanmar restaurants near Rangsit
                University, delivered over Line — built because the students who
                follow these restaurants were checking several Facebook pages and
                Line groups separately every morning just to see what was on offer.
            </p>

            <div className="mt-8 flex flex-wrap gap-1.5">
                {[
                    "Python",
                    "Flask",
                    "waitress",
                    "Google Gemini API",
                    "Line Messaging API",
                    "Playwright",
                    "APScheduler",
                    "pytest",
                ].map((tech) => (
                    <span
                        key={tech}
                        className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400"
                    >
                        {tech}
                    </span>
                ))}
            </div>

            <ul className="mt-6 max-w-2xl list-disc space-y-2 pl-5 text-slate-300">
                <li>
                    Two ingestion paths into one extraction pipeline: a Playwright
                    scraper for restaurants posting on Facebook, and a Line webhook
                    for restaurants that post directly in a Line group.
                </li>
                <li>
                    Uses the Gemini API (text and vision) to read dish names and
                    prices from Burmese-language posts or photographed menu boards,
                    with model fallback restricted to genuinely transient failures.
                </li>
                <li>
                    A Line Flex-message ordering flow — tap a restaurant&apos;s card,
                    pick items and quantities by DM, get a summary to send the
                    restaurant — backed by an atomic on-disk menu store.
                </li>
                <li>
                    Hardened through a self-run production-readiness review: fixed 15
                    findings (race conditions, unhandled exceptions reaching the
                    webhook, duplicate message delivery), moved off the Flask dev
                    server to waitress, and covered every fix with a 76-test pytest
                    suite.
                </li>
                <li>Scheduled for 08:00 Thailand time so menus land before first classes.</li>
            </ul>

            <div className="mt-8 flex gap-4 text-sm font-medium">
                <a
                    href="https://github.com/akkminn/menu-checker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline underline-offset-2 hover:text-slate-300"
                >
                    Source on GitHub →
                </a>
            </div>
        </PageContainer>
    );
}
