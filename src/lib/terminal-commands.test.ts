import { describe, expect, it } from "vitest";

import { PROJECTS } from "@/lib/ai/projects-data";

import { complete, runCommand } from "./terminal-commands";

const linesOf = (input: string) => {
    const result = runCommand(input);
    if (result.type !== "output" && result.type !== "navigate") {
        throw new Error(`expected output for "${input}", got ${result.type}`);
    }
    return result.lines.join("\n");
};

describe("runCommand", () => {
    it("lists every command in help", () => {
        const help = linesOf("help");
        for (const name of ["whoami", "projects", "skills", "contact", "cd <page>", "open <project>", "clear", "exit"]) {
            expect(help).toContain(name);
        }
    });

    it("answers whoami with only facts the site already states", () => {
        const lines = linesOf("whoami");
        expect(lines).toContain("Bangkok, Thailand");
        expect(lines).toContain("Rangsit University");
    });

    it("lists the real projects, not an invented set", () => {
        const lines = linesOf("projects");
        for (const project of PROJECTS) expect(lines).toContain(project.name);
    });

    it("ignores case and surrounding whitespace", () => {
        expect(linesOf("  WHOAMI  ")).toBe(linesOf("whoami"));
    });

    describe("cd", () => {
        it("navigates to a page", () => {
            expect(runCommand("cd about")).toMatchObject({ type: "navigate", href: "/about" });
            expect(runCommand("cd /contact")).toMatchObject({ type: "navigate", href: "/contact" });
            expect(runCommand("cd home")).toMatchObject({ type: "navigate", href: "/" });
        });

        it("says so when the page does not exist, or none was given", () => {
            expect(runCommand("cd nowhere")).toMatchObject({ type: "output" });
            expect(linesOf("cd nowhere")).toContain("no such page: nowhere");
            expect(linesOf("cd")).toContain("which page?");
        });
    });

    describe("open", () => {
        it("opens a project by name, without needing spaces or hyphens", () => {
            expect(runCommand("open studybuddy")).toMatchObject({
                type: "navigate",
                href: "/projects/studybuddy",
            });
            expect(runCommand("open ask-about-me")).toMatchObject({ type: "navigate", href: "/projects" });
            expect(runCommand("open MenuChecker")).toMatchObject({
                type: "navigate",
                href: "/projects/menuchecker",
            });
        });

        it("says so when the project does not exist", () => {
            expect(linesOf("open nothing")).toContain("no such project: nothing");
        });
    });

    it("returns the screen-control results", () => {
        expect(runCommand("clear")).toEqual({ type: "clear" });
        expect(runCommand("exit")).toEqual({ type: "close" });
        expect(runCommand("quit")).toEqual({ type: "close" });
    });

    it("keeps sudo out of help but still answers it", () => {
        expect(linesOf("help")).not.toContain("sudo");
        expect(linesOf("sudo rm -rf /")).toContain("Nice try");
    });

    it("suggests the nearest command for an unknown one", () => {
        const lines = linesOf("proj");
        expect(lines).toContain("command not found: proj");
        expect(lines).toContain('Did you mean "projects"?');
        expect(linesOf("zzz")).toContain('Type "help"');
    });
});

describe("complete", () => {
    it("finishes a unique command name", () => {
        expect(complete("who")).toBe("whoami");
        expect(complete("proj")).toBe("projects");
    });

    it("adds a space after a command that takes an argument", () => {
        expect(complete("cd")).toBe("cd ");
        expect(complete("op")).toBe("open ");
    });

    it("stops at the shared prefix when several commands fit", () => {
        expect(complete("c")).toBe("c");
        expect(complete("co")).toBe("contact");
    });

    it("completes the argument of cd and open", () => {
        expect(complete("cd ab")).toBe("cd about");
        expect(complete("open study")).toBe("open studybuddy");
    });

    it("leaves the input alone when nothing fits", () => {
        expect(complete("xyz")).toBe("xyz");
        expect(complete("cd zzz")).toBe("cd zzz");
        expect(complete("whoami now")).toBe("whoami now");
    });
});
