// Kept in one place so the `getProjects` tool and the Projects pages stay
// honest and in sync — only real, currently-listed work, nothing invented.
export type Project = {
    id: string;
    name: string;
    summary: string;
    stack: string[];
    status: "concept" | "live";
    href: string; // internal project detail page
    liveHref?: string;
    githubHref?: string;
};

export const PROJECTS: Project[] = [
    {
        id: "study-buddy",
        name: "StudyBuddy",
        summary:
            "An AI-powered learning platform that turns uploaded class notes into gamified quizzes and smart flashcards.",
        stack: ["React", "TypeScript", "Firebase", "Google Gemini API", "Tailwind CSS"],
        status: "live",
        href: "/projects/studybuddy",
        liveHref: "https://studybuddy-eight-red.vercel.app",
        githubHref: "https://github.com/akkminn/studybuddy",
    },
    {
        id: "menu-checker",
        name: "MenuChecker",
        summary:
            "A daily restaurant-menu bot for Myanmar restaurants near Rangsit University, delivered over Line.",
        stack: ["Python", "Flask", "Google Gemini API", "Line Messaging API", "Playwright"],
        status: "live",
        href: "/projects/menuchecker",
        githubHref: "https://github.com/akkminn/menu-checker",
    },
    {
        id: "ask-about-me",
        name: "Ask about me",
        summary:
            "This chat widget itself — a streaming AI assistant backed by Google Gemini, embedded across the whole portfolio.",
        stack: ["Next.js API routes", "Vercel AI SDK", "Google Gemini"],
        status: "live",
        href: "/projects",
    },
];
