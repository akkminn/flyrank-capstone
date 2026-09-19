import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import ErrorBoundary from "@/app/error";

describe("route error boundary", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("gives the visitor a way to recover instead of a blank page", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const reset = vi.fn();
        render(<ErrorBoundary error={new Error("render blew up")} reset={reset} />);

        expect(
            screen.getByRole("heading", { name: "Something broke on this page" })
        ).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Try again" }));
        expect(reset).toHaveBeenCalledTimes(1);

        expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/");
    });

    it("reports the underlying error to the console for debugging", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const error = new Error("render blew up");

        render(<ErrorBoundary error={error} reset={vi.fn()} />);

        expect(consoleError).toHaveBeenCalledWith("[route-error]", error);
    });

    it("doesn't leak the error's message into the page", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        render(
            <ErrorBoundary error={new Error("secret stack detail")} reset={vi.fn()} />
        );

        expect(screen.queryByText(/secret stack detail/)).not.toBeInTheDocument();
    });
});
