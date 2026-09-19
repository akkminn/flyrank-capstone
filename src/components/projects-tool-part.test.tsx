import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectsToolPart } from "@/components/projects-tool-part";
import type { Project } from "@/lib/ai/projects-data";
import type { PortfolioUIMessage } from "@/lib/ai/tools";

type ToolPart = Extract<PortfolioUIMessage["parts"][number], { type: "tool-getProjects" }>;

const studyBuddy: Project = {
    id: "study-buddy",
    name: "StudyBuddy",
    summary: "Turns class notes into quizzes.",
    stack: ["React", "Firebase"],
    status: "live",
    href: "/projects/studybuddy",
};

const menuChecker: Project = {
    id: "menu-checker",
    name: "MenuChecker",
    summary: "A daily menu bot.",
    stack: ["Python"],
    status: "concept",
    href: "/projects/menuchecker",
};

function part(overrides: Record<string, unknown>): ToolPart {
    return {
        type: "tool-getProjects",
        toolCallId: "call-1",
        ...overrides,
    } as ToolPart;
}

describe("ProjectsToolPart", () => {
    it("shows a quiet 'preparing' status while the tool input is still streaming", () => {
        render(<ProjectsToolPart part={part({ state: "input-streaming" })} />);

        expect(screen.getByText("Preparing to look up projects…")).toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("names the project being looked up once the input is available", () => {
        render(
            <ProjectsToolPart
                part={part({ state: "input-available", input: { name: "StudyBuddy" } })}
            />
        );

        expect(screen.getByText('Looking up "StudyBuddy"…')).toBeInTheDocument();
    });

    it("falls back to a generic lookup message when no project name was given", () => {
        render(<ProjectsToolPart part={part({ state: "input-available", input: {} })} />);

        expect(screen.getByText("Looking up Minn's projects…")).toBeInTheDocument();
    });

    it("renders each returned project as a link to its page, with status and stack", () => {
        render(
            <ProjectsToolPart
                part={part({
                    state: "output-available",
                    input: {},
                    output: { projects: [studyBuddy, menuChecker] },
                })}
            />
        );

        const studyBuddyLink = screen.getByRole("link", { name: /StudyBuddy/ });
        expect(studyBuddyLink).toHaveAttribute("href", "/projects/studybuddy");
        expect(within(studyBuddyLink).getByText("live")).toBeInTheDocument();
        expect(within(studyBuddyLink).getByText("Firebase")).toBeInTheDocument();

        const menuCheckerLink = screen.getByRole("link", { name: /MenuChecker/ });
        expect(menuCheckerLink).toHaveAttribute("href", "/projects/menuchecker");
        expect(within(menuCheckerLink).getByText("concept")).toBeInTheDocument();
    });

    it("treats an empty result as 'no results', pointing to the full projects list", () => {
        render(
            <ProjectsToolPart
                part={part({
                    state: "output-available",
                    input: { name: "Robot Butler" },
                    output: { projects: [] },
                })}
            />
        );

        expect(screen.getByText('No project named "Robot Butler".')).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /See all projects/ })).toHaveAttribute(
            "href",
            "/projects"
        );
        // A miss is a normal outcome, not a failure.
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("announces a failed tool call as an alert with the error text", () => {
        render(
            <ProjectsToolPart
                part={part({
                    state: "output-error",
                    input: {},
                    errorText: "The projects data source is unreachable.",
                })}
            />
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
            "The projects data source is unreachable."
        );
    });
});
