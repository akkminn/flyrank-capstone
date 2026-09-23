import { TECH } from "@/components/hero/hero-config";
import { PROJECTS } from "@/lib/ai/projects-data";

// What the terminal does with a line of input. Kept free of React so the whole
// command set can be tested as plain functions.
export type CommandResult =
    | { type: "output"; lines: string[] }
    | { type: "navigate"; href: string; lines: string[] }
    | { type: "clear" }
    | { type: "close" };

const PAGES: Record<string, string> = {
    home: "/",
    about: "/about",
    experience: "/experience",
    projects: "/projects",
    contact: "/contact",
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const PROJECT_TARGETS = Object.fromEntries(PROJECTS.map((project) => [slug(project.name), project]));

type Command = {
    summary: string;
    usage?: string;
    run: (args: string[]) => CommandResult;
    arguments?: () => string[];
};

const output = (...lines: string[]): CommandResult => ({ type: "output", lines });

const COMMANDS: Record<string, Command> = {
    help: {
        summary: "list the available commands",
        run: () =>
            output(
                "Available commands:",
                ...Object.entries(COMMANDS).map(
                    ([name, command]) => `  ${(command.usage ?? name).padEnd(14)} ${command.summary}`
                ),
                "",
                "Tab completes, and the up and down arrows walk through earlier commands."
            ),
    },
    whoami: {
        summary: "who Minn is",
        run: () =>
            output(
                "Aung Ko Ko Minn (Minn)",
                "Software developer, frontend and full-stack",
                "Bangkok, Thailand",
                "B.Sc. Information and Communication Technology, Rangsit University"
            ),
    },
    experience: {
        summary: "where Minn has worked",
        run: () =>
            output(
                "2026-07 to now      Front-end AI Engineering Intern, FlyRank AI",
                "2025-02 to now      Full-Stack Developer, Theinngu Yogi Management System",
                "2021-07 to 2022-02  Volunteer Mathematics Teacher, Zee Kwat Academy",
                "",
                'Run "cd experience" for the full story.'
            ),
    },
    projects: {
        summary: "what Minn has built",
        run: () =>
            output(
                ...PROJECTS.map((project) => `* ${project.name}: ${project.summary}`),
                "",
                'Run "open <name>" to see one, for example "open studybuddy".'
            ),
    },
    skills: {
        summary: "the tech stack",
        run: () => output(TECH.map((tech) => tech.name).join(", ")),
    },
    contact: {
        summary: "how to reach Minn",
        run: () =>
            output(
                "email     maungkokominn@gmail.com",
                "github    github.com/akkminn",
                "linkedin  linkedin.com/in/akkminn",
                "",
                'Run "cd contact" for the contact page.'
            ),
    },
    ls: {
        summary: "list the pages",
        run: () => output(Object.keys(PAGES).join("  ")),
    },
    cd: {
        summary: "go to a page",
        usage: "cd <page>",
        arguments: () => Object.keys(PAGES),
        run: ([target]) => {
            if (!target) return output('cd: which page? Try "ls" to see them.');
            const href = PAGES[target.toLowerCase().replace(/^\/|\/$/g, "")];
            if (!href) return output(`cd: no such page: ${target}`, 'Try "ls" to see them.');
            return { type: "navigate", href, lines: [`Opening ${target}...`] };
        },
    },
    open: {
        summary: "open a project",
        usage: "open <project>",
        arguments: () => Object.keys(PROJECT_TARGETS),
        run: ([target]) => {
            if (!target) return output('open: which project? Try "projects" to see them.');
            const project = PROJECT_TARGETS[slug(target)];
            if (!project) return output(`open: no such project: ${target}`, 'Try "projects" to see them.');
            return { type: "navigate", href: project.href, lines: [`Opening ${project.name}...`] };
        },
    },
    clear: { summary: "clear the screen", run: () => ({ type: "clear" }) },
    exit: { summary: "close the terminal", run: () => ({ type: "close" }) },
};

const EASTER_EGGS: Record<string, () => CommandResult> = {
    sudo: () => output("Nice try. Nothing here needs root, and nothing here is secret."),
    quit: () => ({ type: "close" }),
};

const COMMAND_NAMES = Object.keys(COMMANDS);

export function runCommand(line: string): CommandResult {
    const [name = "", ...args] = line.trim().split(/\s+/);
    const key = name.toLowerCase();

    const command = COMMANDS[key];
    if (command) return command.run(args);
    const easterEgg = EASTER_EGGS[key];
    if (easterEgg) return easterEgg();

    const nearest = COMMAND_NAMES.find((candidate) => candidate.startsWith(key));
    return output(
        `command not found: ${name}`,
        nearest ? `Did you mean "${nearest}"?` : 'Type "help" to see what you can do.'
    );
}

function commonPrefix(words: string[]): string {
    return words.reduce((prefix, word) => {
        let end = 0;
        while (end < prefix.length && end < word.length && prefix[end] === word[end]) end++;
        return prefix.slice(0, end);
    });
}

export function complete(input: string): string {
    const parts = input.replace(/^\s+/, "").split(/\s+/);
    const current = parts[parts.length - 1].toLowerCase();

    let candidates: string[];
    if (parts.length === 1) {
        candidates = COMMAND_NAMES;
    } else if (parts.length === 2) {
        candidates = COMMANDS[parts[0].toLowerCase()]?.arguments?.() ?? [];
    } else {
        return input;
    }

    const matches = candidates.filter((candidate) => candidate.startsWith(current));
    if (matches.length === 0) return input;

    const completed = commonPrefix(matches);
    const head = input.slice(0, input.length - current.length);
    return matches.length === 1 && parts.length === 1 && COMMANDS[completed]?.arguments
        ? `${head}${completed} `
        : `${head}${completed}`;
}
