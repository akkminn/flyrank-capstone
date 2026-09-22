import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { openTerminal } from "@/lib/terminal-events";

import { PortfolioTerminal } from "./portfolio-terminal";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

// The screen is a lazy chunk. Importing it up front means a cold import can't
// make the first test in the file wait on module loading.
beforeAll(() => import("./terminal-session"));

beforeEach(() => push.mockClear());

async function openFromLauncher(user: ReturnType<typeof userEvent.setup>) {
    render(<PortfolioTerminal />);
    await user.click(screen.getByRole("button", { name: "Open terminal" }));
    const dialog = await screen.findByRole("dialog", { name: "Terminal" });
    const prompt = await within(dialog).findByRole("textbox", { name: "Terminal command" });
    return { dialog, prompt };
}

describe("PortfolioTerminal", () => {
    it("is closed until opened, then puts the cursor in the prompt", async () => {
        const user = userEvent.setup();
        render(<PortfolioTerminal />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Open terminal" }));
        const prompt = await screen.findByRole("textbox", { name: "Terminal command" });
        expect(screen.getByRole("dialog", { name: "Terminal" })).toHaveAttribute("aria-modal", "true");
        expect(prompt).toHaveFocus();
    });

    it("runs a command and shows its output in the log", async () => {
        const user = userEvent.setup();
        const { dialog, prompt } = await openFromLauncher(user);

        await user.type(prompt, "whoami{Enter}");

        const log = within(dialog).getByRole("log", { name: "Terminal output" });
        expect(log).toHaveTextContent("whoami");
        expect(log).toHaveTextContent("Bangkok, Thailand");
        expect(prompt).toHaveValue("");
    });

    it("says so for a command it doesn't know", async () => {
        const user = userEvent.setup();
        const { dialog, prompt } = await openFromLauncher(user);

        await user.type(prompt, "frobnicate{Enter}");

        expect(within(dialog).getByRole("log")).toHaveTextContent("command not found: frobnicate");
    });

    it("clears the screen", async () => {
        const user = userEvent.setup();
        const { dialog, prompt } = await openFromLauncher(user);
        await user.type(prompt, "whoami{Enter}");
        expect(within(dialog).getByRole("log")).toHaveTextContent("Bangkok");

        await user.type(prompt, "clear{Enter}");

        expect(within(dialog).getByRole("log")).not.toHaveTextContent("Bangkok");
        expect(within(dialog).getByRole("log")).not.toHaveTextContent("whoami");
    });

    it("recalls earlier commands with the arrow keys", async () => {
        const user = userEvent.setup();
        const { prompt } = await openFromLauncher(user);
        await user.type(prompt, "whoami{Enter}");
        await user.type(prompt, "skills{Enter}");

        await user.keyboard("{ArrowUp}");
        expect(prompt).toHaveValue("skills");
        await user.keyboard("{ArrowUp}");
        expect(prompt).toHaveValue("whoami");
        await user.keyboard("{ArrowUp}");
        expect(prompt).toHaveValue("whoami");
        await user.keyboard("{ArrowDown}");
        expect(prompt).toHaveValue("skills");
        await user.keyboard("{ArrowDown}");
        expect(prompt).toHaveValue("");
    });

    it("completes with Tab, and only holds on to Tab when there is something to complete", async () => {
        const user = userEvent.setup();
        const { dialog, prompt } = await openFromLauncher(user);

        await user.type(prompt, "proj{Tab}");
        expect(prompt).toHaveValue("projects");
        expect(prompt).toHaveFocus();

        await user.clear(prompt);
        await user.tab();
        expect(within(dialog).getByRole("button", { name: "Close terminal" })).toHaveFocus();
    });

    it("keeps Tab and Shift+Tab inside the dialog", async () => {
        const user = userEvent.setup();
        const { dialog, prompt } = await openFromLauncher(user);
        const close = within(dialog).getByRole("button", { name: "Close terminal" });

        prompt.focus();
        await user.tab();
        expect(close).toHaveFocus();
        await user.tab();
        expect(prompt).toHaveFocus();
        await user.tab({ shift: true });
        expect(close).toHaveFocus();
    });

    it("closes on Escape and hands focus back to whatever opened it", async () => {
        const user = userEvent.setup();
        const { dialog } = await openFromLauncher(user);

        await user.keyboard("{Escape}");

        expect(dialog).not.toBeVisible();
        expect(screen.getByRole("button", { name: "Open terminal" })).toHaveFocus();
    });

    it("closes with the exit command", async () => {
        const user = userEvent.setup();
        const { dialog, prompt } = await openFromLauncher(user);

        await user.type(prompt, "exit{Enter}");

        expect(dialog).not.toBeVisible();
    });

    it("navigates with cd, then closes", async () => {
        const user = userEvent.setup();
        const { dialog, prompt } = await openFromLauncher(user);

        await user.type(prompt, "cd about{Enter}");

        expect(push).toHaveBeenCalledExactlyOnceWith("/about");
        expect(dialog).not.toBeVisible();
    });

    it("keeps the history when it is closed and opened again", async () => {
        const user = userEvent.setup();
        const { prompt } = await openFromLauncher(user);
        await user.type(prompt, "whoami{Enter}");
        await user.keyboard("{Escape}");

        await user.click(screen.getByRole("button", { name: "Open terminal" }));

        expect(screen.getByRole("log")).toHaveTextContent("Bangkok, Thailand");
        expect(await screen.findByRole("textbox", { name: "Terminal command" })).toHaveFocus();
    });

    it("can be opened from elsewhere on the page and returns focus there", async () => {
        const user = userEvent.setup();
        render(
            <>
                <button type="button" onClick={openTerminal}>
                    Try the terminal
                </button>
                <PortfolioTerminal />
            </>
        );
        const opener = screen.getByRole("button", { name: "Try the terminal" });

        await user.click(opener);
        expect(await screen.findByRole("dialog", { name: "Terminal" })).toBeVisible();
        await user.keyboard("{Escape}");

        expect(opener).toHaveFocus();
    });

    it("closes when the dim backdrop is clicked, but not when the window is", async () => {
        const user = userEvent.setup();
        const { dialog } = await openFromLauncher(user);

        await user.click(dialog);
        expect(dialog).toBeVisible();

        await user.click(dialog.parentElement as HTMLElement);
        expect(dialog).not.toBeVisible();
    });
});
